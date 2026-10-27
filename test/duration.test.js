'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDuration } = require('../src/duration');

test('parseDuration converts units to seconds', () => {
  assert.equal(parseDuration('30s'), 30);
  assert.equal(parseDuration('15m'), 900);
  assert.equal(parseDuration('2h'), 7200);
  assert.equal(parseDuration('1d'), 86400);
  assert.equal(parseDuration('2w'), 1209600);
});

test('parseDuration takes numbers as seconds', () => {
  assert.equal(parseDuration(90), 90);
});

test('parseDuration rejects bad input', () => {
  assert.throws(() => parseDuration('soon'));
  assert.throws(() => parseDuration('0m'));
  assert.throws(() => parseDuration('0w'));
  assert.throws(() => parseDuration('1y'));
  assert.throws(() => parseDuration(-5));
});
