'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePageParams, paginate } = require('../src/paginate');

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

test('paginate returns the first page for page 1', () => {
  const items = Array.from({ length: 40 }, (_, i) => i + 1);
  const result = paginate(items, { page: 1, size: 20 });
  assert.deepEqual(result.items, items.slice(0, 20));
  assert.equal(result.totalPages, 2);
  assert.equal(result.hasNext, true);
});

test('paginate reports no next page on the last page', () => {
  const items = Array.from({ length: 40 }, (_, i) => i + 1);
  const result = paginate(items, { page: 2, size: 20 });
  assert.deepEqual(result.items, items.slice(20));
  assert.equal(result.hasNext, false);
});

test('paginate counts the trailing partial page', () => {
  const items = Array.from({ length: 41 }, (_, i) => i + 1);
  const result = paginate(items, { page: 2, size: 20 });
  assert.equal(result.totalPages, 3);
  assert.equal(result.hasNext, true);
  assert.deepEqual(paginate(items, { page: 3, size: 20 }).items, [41]);
});

test('paginate reports one page for fewer items than the page size', () => {
  const items = Array.from({ length: 5 }, (_, i) => i + 1);
  const result = paginate(items, { page: 1, size: 20 });
  assert.equal(result.totalPages, 1);
  assert.equal(result.hasNext, false);
});
