'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { issueToken, verifyToken } = require('../src/tokens');

const SECRET = 'test-secret';

test('a freshly issued token verifies', () => {
  const claims = verifyToken(issueToken('alice', SECRET), SECRET);
  assert.equal(claims.sub, 'alice');
});

test('a tampered token is rejected', () => {
  const [payload, sig] = issueToken('alice', SECRET).split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'bob', exp: 9999999999 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`, SECRET), null);
  assert.equal(verifyToken(`${payload}.${sig}x`, SECRET), null);
});

test('a token signed with another secret is rejected', () => {
  assert.equal(verifyToken(issueToken('alice', 'other'), SECRET), null);
});

test('garbage is rejected', () => {
  assert.equal(verifyToken(undefined, SECRET), null);
  assert.equal(verifyToken('nope', SECRET), null);
});
