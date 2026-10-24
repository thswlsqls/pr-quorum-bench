'use strict';

class NotesStore {
  constructor() {
    this.notes = new Map();
    this.nextId = 1;
  }

  create(owner, text) {
    const note = { id: String(this.nextId++), owner, text, createdAt: new Date().toISOString() };
    this.notes.set(note.id, note);
    return note;
  }

  get(id) {
    return this.notes.get(id) ?? null;
  }

  listByOwner(owner) {
    return [...this.notes.values()].filter((note) => note.owner === owner);
  }

  remove(id) {
    return this.notes.delete(id);
  }
}

module.exports = { NotesStore };
