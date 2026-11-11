const crypto = require("crypto");
const mongoose = require("mongoose");
const { usingMongo } = require("../config/db");

/**
 * One data API for both MongoDB and the built-in in-memory database
 * (used when MONGO_URI isn't set — data then resets on restart).
 */
const memory = new Map();
const table = (name) => {
  if (!memory.has(name)) memory.set(name, []);
  return memory.get(name);
};
const newId = () => crypto.randomBytes(12).toString("hex");
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matches = (item, filter) => Object.entries(filter).every(([k, v]) => String(item[k]) === String(v));

function createStore(def) {
  const { Model, name, searchFields = [] } = def;

  const searchQuery = (q) =>
    q && searchFields.length
      ? { $or: searchFields.map((f) => ({ [f]: { $regex: escapeRegex(q), $options: "i" } })) }
      : {};

  return {
    async list(filter = {}, { q } = {}) {
      const dir = def.newestFirst ? -1 : 1;
      if (usingMongo()) {
        return Model.find({ ...filter, ...searchQuery(q) }).sort({ createdAt: dir, _id: dir }).limit(500).lean();
      }
      const needle = q ? String(q).toLowerCase() : "";
      const rows = table(name)
        .filter((item) => matches(item, filter))
        .filter((item) => !needle || searchFields.some((f) => String(item[f] ?? "").toLowerCase().includes(needle)));
      return dir === -1 ? rows.slice().reverse() : rows.slice();
    },

    async get(id, filter = {}) {
      if (usingMongo()) {
        if (!mongoose.isValidObjectId(id)) return null;
        return Model.findOne({ _id: id, ...filter }).lean();
      }
      return table(name).find((item) => item._id === id && matches(item, filter)) || null;
    },

    async create(data) {
      if (usingMongo()) return (await Model.create(data)).toObject();
      const now = new Date().toISOString();
      const item = { _id: newId(), ...data, createdAt: now, updatedAt: now };
      table(name).push(item);
      return item;
    },

    async update(id, data, filter = {}) {
      if (usingMongo()) {
        if (!mongoose.isValidObjectId(id)) return null;
        return Model.findOneAndUpdate({ _id: id, ...filter }, data, { new: true, runValidators: true }).lean();
      }
      const item = table(name).find((it) => it._id === id && matches(it, filter));
      if (!item) return null;
      Object.assign(item, data, { updatedAt: new Date().toISOString() });
      return item;
    },

    async remove(id, filter = {}) {
      if (usingMongo()) {
        if (!mongoose.isValidObjectId(id)) return false;
        return Boolean(await Model.findOneAndDelete({ _id: id, ...filter }));
      }
      const rows = table(name);
      const index = rows.findIndex((it) => it._id === id && matches(it, filter));
      if (index === -1) return false;
      rows.splice(index, 1);
      return true;
    },

    async count(filter = {}) {
      if (usingMongo()) return Model.countDocuments(filter);
      return table(name).filter((item) => matches(item, filter)).length;
    },

    async findOne(filter) {
      if (usingMongo()) return Model.findOne(filter).lean();
      return table(name).find((item) => matches(item, filter)) || null;
    },
  };
}

module.exports = { createStore };
