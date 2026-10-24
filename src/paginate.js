'use strict';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePageParams(query) {
  const page = Number.parseInt(query.page ?? '1', 10);
  const size = Number.parseInt(query.size ?? String(DEFAULT_PAGE_SIZE), 10);
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError('page must be a positive integer');
  }
  if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
    throw new RangeError(`size must be between 1 and ${MAX_PAGE_SIZE}`);
  }
  return { page, size };
}

function paginate(items, { page, size }) {
  const start = page * size;
  return {
    items: items.slice(start, start + size),
    page,
    size,
    total: items.length,
    hasNext: start + size < items.length,
  };
}

module.exports = { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, parsePageParams, paginate };
