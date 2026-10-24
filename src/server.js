'use strict';

const http = require('node:http');
const { verifyToken } = require('./tokens');
const { parsePageParams, paginate } = require('./paginate');
const { NotesStore } = require('./store');

const MAX_BODY_BYTES = 64 * 1024;

function send(res, status, body) {
  const data = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(data);
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(httpError(413, 'payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(httpError(400, 'invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function authenticate(req, secret) {
  const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  return match ? verifyToken(match[1], secret) : null;
}

function createApp({ secret, store = new NotesStore() }) {
  if (!secret) throw new Error('secret is required');

  return async function handle(req, res) {
    try {
      const claims = authenticate(req, secret);
      if (!claims) return send(res, 401, { error: 'unauthorized' });

      const url = new URL(req.url, 'http://localhost');
      const idMatch = /^\/notes\/([^/]+)$/.exec(url.pathname);

      if (url.pathname === '/notes' && req.method === 'GET') {
        const params = parsePageParams(Object.fromEntries(url.searchParams));
        return send(res, 200, paginate(store.listByOwner(claims.sub), params));
      }
      if (url.pathname === '/notes' && req.method === 'POST') {
        const body = await readJson(req);
        if (typeof body.text !== 'string' || body.text.trim() === '') {
          return send(res, 400, { error: 'text is required' });
        }
        return send(res, 201, store.create(claims.sub, body.text));
      }
      if (idMatch && req.method === 'GET') {
        const note = store.get(idMatch[1]);
        if (!note || note.owner !== claims.sub) return send(res, 404, { error: 'not found' });
        return send(res, 200, note);
      }
      if (idMatch && req.method === 'DELETE') {
        const note = store.get(idMatch[1]);
        if (!note || note.owner !== claims.sub) return send(res, 404, { error: 'not found' });
        store.remove(note.id);
        return send(res, 204);
      }
      return send(res, 404, { error: 'not found' });
    } catch (err) {
      if (err instanceof RangeError) return send(res, 400, { error: err.message });
      if (err.status) return send(res, err.status, { error: err.message });
      return send(res, 500, { error: 'internal error' });
    }
  };
}

function start({ port = Number(process.env.PORT) || 3000, secret = process.env.TOKEN_SECRET } = {}) {
  const server = http.createServer(createApp({ secret }));
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (require.main === module) {
  start().then((server) => console.log(`listening on ${server.address().port}`));
}

module.exports = { createApp, start };
