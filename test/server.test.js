'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp } = require('../src/server');
const { issueToken } = require('../src/tokens');

const SECRET = 'test-secret';

async function withServer(fn) {
  const server = http.createServer(createApp({ secret: SECRET }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

function call(base, method, path, { user, body } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (user) headers.authorization = `Bearer ${issueToken(user, SECRET)}`;
  return fetch(base + path, { method, headers, body: body && JSON.stringify(body) });
}

test('requests without a token are rejected', () =>
  withServer(async (base) => {
    const res = await call(base, 'GET', '/notes');
    assert.equal(res.status, 401);
  }));

test('a note can be created, read and deleted by its owner', () =>
  withServer(async (base) => {
    const created = await call(base, 'POST', '/notes', { user: 'alice', body: { text: 'hello' } });
    assert.equal(created.status, 201);
    const note = await created.json();
    assert.equal(note.text, 'hello');

    const read = await call(base, 'GET', `/notes/${note.id}`, { user: 'alice' });
    assert.equal(read.status, 200);

    const removed = await call(base, 'DELETE', `/notes/${note.id}`, { user: 'alice' });
    assert.equal(removed.status, 204);

    const gone = await call(base, 'GET', `/notes/${note.id}`, { user: 'alice' });
    assert.equal(gone.status, 404);
  }));

test('notes are hidden from other users', () =>
  withServer(async (base) => {
    const created = await call(base, 'POST', '/notes', { user: 'alice', body: { text: 'secret' } });
    const note = await created.json();
    const read = await call(base, 'GET', `/notes/${note.id}`, { user: 'mallory' });
    assert.equal(read.status, 404);
    const removed = await call(base, 'DELETE', `/notes/${note.id}`, { user: 'mallory' });
    assert.equal(removed.status, 404);
  }));

test('empty text is rejected', () =>
  withServer(async (base) => {
    const res = await call(base, 'POST', '/notes', { user: 'alice', body: { text: '  ' } });
    assert.equal(res.status, 400);
  }));
