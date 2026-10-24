'use strict';

const crypto = require('node:crypto');
const { parseDuration } = require('./duration');

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function issueToken(userId, secret, { ttl = '1h', now = Date.now() } = {}) {
  const exp = Math.floor(now / 1000) + parseDuration(ttl);
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token, secret, { now = Date.now() } = {}) {
  if (typeof token !== 'string') return null;
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') return null;
  if (claims.exp <= Math.floor(now / 1000)) return null;
  return claims;
}

module.exports = { issueToken, verifyToken };
