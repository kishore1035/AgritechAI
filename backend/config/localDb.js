const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'data', 'localdb.json');

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2));
}

function readDb() {
  ensureDbFile();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getPath(obj, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setPath(obj, key, value) {
  const parts = key.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function compareOps(docValue, condValue) {
  const dv = docValue instanceof Date ? docValue.getTime() : docValue;
  const cv = condValue instanceof Date ? condValue.getTime() : condValue;
  return { dv, cv };
}

function valueMatches(docValue, condition) {
  if (
    condition &&
    typeof condition === 'object' &&
    !Array.isArray(condition) &&
    !(condition instanceof Date)
  ) {
    return Object.entries(condition).every(([op, expected]) => {
      const { dv, cv } = compareOps(docValue, expected);
      switch (op) {
        case '$gte': return dv >= cv;
        case '$gt': return dv > cv;
        case '$lte': return dv <= cv;
        case '$lt': return dv < cv;
        case '$ne': return dv !== cv;
        case '$eq': return dv === cv;
        case '$in': return Array.isArray(expected) && expected.includes(dv);
        case '$nin': return Array.isArray(expected) && !expected.includes(dv);
        case '$exists': return expected ? docValue !== undefined : docValue === undefined;
        case '$regex': {
          const re = expected instanceof RegExp ? expected : new RegExp(expected, 'i');
          return re.test(String(docValue ?? ''));
        }
        default:
          return dv === cv;
      }
    });
  }

  if (Array.isArray(docValue) && !Array.isArray(condition)) {
    return docValue.includes(condition);
  }

  return docValue === condition;
}

function matches(doc, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    const actual = getPath(doc, key);
    return valueMatches(actual, expected);
  });
}

function applySort(items, sortSpec) {
  if (!sortSpec) return items;
  const entries = Object.entries(sortSpec);
  const sorted = [...items].sort((a, b) => {
    for (const [key, dir] of entries) {
      const av = getPath(a, key);
      const bv = getPath(b, key);
      if (av === bv) continue;
      const sign = dir >= 0 ? 1 : -1;
      return av > bv ? sign : -sign;
    }
    return 0;
  });
  return sorted;
}

function applySelect(doc, selectSpec) {
  if (!selectSpec) return doc;
  const fields = String(selectSpec).split(/\s+/).filter(Boolean);
  if (!fields.length) return doc;

  const exclude = fields.every(f => f.startsWith('-'));
  if (exclude) {
    const copy = { ...doc };
    for (const f of fields) delete copy[f.slice(1)];
    return copy;
  }

  const selected = { _id: doc._id };
  for (const f of fields) {
    if (!f.startsWith('-') && Object.prototype.hasOwnProperty.call(doc, f)) {
      selected[f] = doc[f];
    }
  }
  return selected;
}

function makeThenable(run) {
  return {
    exec: () => run(),
    then: (resolve, reject) => run().then(resolve, reject),
    catch: (reject) => run().catch(reject),
  };
}

class LocalQuery {
  constructor(run, single = false) {
    this._run = run;
    this._single = single;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._select = null;
  }

  sort(spec) { this._sort = spec; return this; }
  skip(n) { this._skip = Number(n) || 0; return this; }
  limit(n) { this._limit = Number(n); return this; }
  select(spec) { this._select = spec; return this; }

  async exec() {
    let rows = await this._run();
    rows = applySort(rows, this._sort);
    if (this._skip) rows = rows.slice(this._skip);
    if (Number.isFinite(this._limit)) rows = rows.slice(0, this._limit);

    if (this._single) {
      const one = rows[0] || null;
      if (!one) return null;
      return applySelect(one, this._select);
    }

    return rows.map(r => applySelect(r, this._select));
  }

  then(resolve, reject) { return this.exec().then(resolve, reject); }
  catch(reject) { return this.exec().catch(reject); }
}

function createLocalModel(collectionName, options = {}) {
  const { timestamps = false } = options;

  return class LocalModel {
    constructor(data = {}) {
      Object.assign(this, clone(data));
      if (!this._id) this._id = randomUUID();
      const now = new Date();
      if (timestamps && !this.createdAt) this.createdAt = now;
      if (timestamps && !this.updatedAt) this.updatedAt = now;
    }

    toObject() {
      const plain = {};
      for (const [k, v] of Object.entries(this)) {
        if (typeof v !== 'function') plain[k] = v;
      }
      return clone(plain);
    }

    async save() {
      const db = readDb();
      const list = Array.isArray(db[collectionName]) ? db[collectionName] : [];
      if (timestamps) this.updatedAt = new Date();

      const idx = list.findIndex(d => String(d._id) === String(this._id));
      const payload = this.toObject();

      if (idx >= 0) list[idx] = payload;
      else list.push(payload);

      db[collectionName] = list;
      writeDb(db);
      return this;
    }

    static _list() {
      const db = readDb();
      if (!Array.isArray(db[collectionName])) db[collectionName] = [];
      return db[collectionName].map(item => new this(item));
    }

    static async create(data) {
      const doc = new this(data);
      await doc.save();
      return doc;
    }

    static async insertMany(items) {
      const created = [];
      for (const item of items) {
        created.push(await this.create(item));
      }
      return created;
    }

    static find(filter = {}) {
      return new LocalQuery(async () => this._list().filter(d => matches(d, filter)), false);
    }

    static findOne(filter = {}) {
      return new LocalQuery(async () => this._list().filter(d => matches(d, filter)), true);
    }

    static async countDocuments(filter = {}) {
      return this._list().filter(d => matches(d, filter)).length;
    }

    static findOneAndUpdate(filter = {}, update = {}, opts = {}) {
      return makeThenable(async () => {
        const db = readDb();
        const list = Array.isArray(db[collectionName]) ? db[collectionName] : [];
        const idx = list.findIndex(d => matches(d, filter));
        if (idx < 0) return null;

        const next = clone(list[idx]);
        if (update.$set && typeof update.$set === 'object') {
          for (const [k, v] of Object.entries(update.$set)) setPath(next, k, v);
        } else {
          Object.assign(next, update);
        }
        if (timestamps) next.updatedAt = new Date();

        list[idx] = next;
        db[collectionName] = list;
        writeDb(db);

        return opts.new ? new this(next) : new this(list[idx]);
      });
    }

    static findByIdAndUpdate(id, update = {}, opts = {}) {
      return this.findOneAndUpdate({ _id: id }, update, opts);
    }

    static async updateMany(filter = {}, update = {}) {
      const db = readDb();
      const list = Array.isArray(db[collectionName]) ? db[collectionName] : [];
      let modifiedCount = 0;

      const nextList = list.map((item) => {
        if (!matches(item, filter)) return item;
        const copy = clone(item);
        if (update.$set && typeof update.$set === 'object') {
          for (const [k, v] of Object.entries(update.$set)) setPath(copy, k, v);
        } else {
          Object.assign(copy, update);
        }
        if (timestamps) copy.updatedAt = new Date();
        modifiedCount += 1;
        return copy;
      });

      db[collectionName] = nextList;
      writeDb(db);
      return { modifiedCount };
    }

    static async deleteOne(filter = {}) {
      const db = readDb();
      const list = Array.isArray(db[collectionName]) ? db[collectionName] : [];
      const idx = list.findIndex(d => matches(d, filter));
      if (idx < 0) return { deletedCount: 0 };
      list.splice(idx, 1);
      db[collectionName] = list;
      writeDb(db);
      return { deletedCount: 1 };
    }

    static async deleteMany(filter = {}) {
      const db = readDb();
      const list = Array.isArray(db[collectionName]) ? db[collectionName] : [];
      const kept = list.filter(d => !matches(d, filter));
      const deletedCount = list.length - kept.length;
      db[collectionName] = kept;
      writeDb(db);
      return { deletedCount };
    }

    static findOneAndDelete(filter = {}) {
      return makeThenable(async () => {
        const db = readDb();
        const list = Array.isArray(db[collectionName]) ? db[collectionName] : [];
        const idx = list.findIndex(d => matches(d, filter));
        if (idx < 0) return null;
        const [removed] = list.splice(idx, 1);
        db[collectionName] = list;
        writeDb(db);
        return new this(removed);
      });
    }
  };
}

module.exports = { createLocalModel };