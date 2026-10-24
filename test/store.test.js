'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { FileNotesStore } = require('../src/store');

test('notes survive a reload', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'notes-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'notes.json');

  const first = await new FileNotesStore(file).load();
  const note = await first.create('alice', 'hello');
  await first.update(note.id, 'hello again');

  const second = await new FileNotesStore(file).load();
  const loaded = await second.get(note.id);
  assert.equal(loaded.text, 'hello again');
  assert.deepEqual((await second.listByOwner('alice')).map((n) => n.id), [note.id]);
});

test('a missing file starts empty', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'notes-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const store = await new FileNotesStore(path.join(dir, 'nested', 'notes.json')).load();
  assert.deepEqual(await store.listByOwner('alice'), []);
});
