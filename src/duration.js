'use strict';

const UNITS = { s: 1, m: 60, h: 3600, d: 86400 };

// Parses "30s", "15m", "1h" or "7d" into seconds. Numbers are taken as seconds.
function parseDuration(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  const match = /^(\d+)\s*([smhd])$/.exec(String(value).trim());
  if (!match || Number(match[1]) === 0) {
    throw new Error(`invalid duration: ${value}`);
  }
  return Number(match[1]) * UNITS[match[2]];
}

module.exports = { parseDuration };
