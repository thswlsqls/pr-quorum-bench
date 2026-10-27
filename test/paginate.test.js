'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePageParams } = require('../src/paginate');

test('parsePageParams applies defaults', () => {
  assert.deepEqual(parsePageParams({}), { page: 1, size: 20 });
});

test('parsePageParams parses explicit values', () => {
  assert.deepEqual(parsePageParams({ page: '3', size: '50' }), { page: 3, size: 50 });
});

test('parsePageParams rejects out-of-range values', () => {
  assert.throws(() => parsePageParams({ page: '0' }), RangeError);
  assert.throws(() => parsePageParams({ page: 'abc' }), RangeError);
  assert.throws(() => parsePageParams({ size: '0' }), RangeError);
  assert.throws(() => parsePageParams({ size: '101' }), RangeError);
});

test('parsePageParams accepts per_page as an alias of size', () => {
  assert.deepEqual(parsePageParams({ per_page: '30' }), { page: 1, size: 30 });
  assert.deepEqual(parsePageParams({ size: '10', per_page: '30' }), { page: 1, size: 10 });
  assert.throws(() => parsePageParams({ per_page: '101' }), RangeError);
});
