'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

class NotesStore {
  constructor() {
    this.notes = new Map();
    this.nextId = 1;
  }

  async create(owner, text) {
    const note = { id: String(this.nextId++), owner, text, createdAt: new Date().toISOString() };
    this.notes.set(note.id, note);
    await this.persist();
    return note;
  }

  async get(id) {
    return this.notes.get(id) ?? null;
  }

  async listByOwner(owner) {
    return [...this.notes.values()].filter((note) => note.owner === owner);
  }

  async update(id, text) {
    const note = this.notes.get(id);
    if (!note) return null;
    note.text = text;
    note.updatedAt = new Date().toISOString();
    await this.persist();
    return note;
  }

  async remove(id) {
    const removed = this.notes.delete(id);
    if (removed) await this.persist();
    return removed;
  }

  async persist() {}
}

// Keeps every note in one JSON file. Writes go through a temp file and a
// rename, and are queued so that concurrent writes land in order.
class FileNotesStore extends NotesStore {
  constructor(file) {
    super();
    this.file = file;
    this.queue = Promise.resolve();
  }

  async load() {
    try {
      const raw = await fs.readFile(this.file, 'utf8');
      this.notes = new Map(JSON.parse(raw).map((note) => [note.id, note]));
    } catch {
      this.notes = new Map();
    }
    this.nextId = this.notes.size + 1;
    return this;
  }

  persist() {
    const write = () => this.#write();
    this.queue = this.queue.then(write, write);
    return this.queue;
  }

  async #write() {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify([...this.notes.values()], null, 2));
    await fs.rename(tmp, this.file);
  }
}

module.exports = { NotesStore, FileNotesStore };
