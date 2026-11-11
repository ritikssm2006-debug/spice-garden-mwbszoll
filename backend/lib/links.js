const { createStore } = require("./store");

/**
 * Linked fields (e.g. a booking's "room") store the id of an item in another
 * collection. This checks the item exists (and, for private data, that it
 * belongs to the same user).
 */
const defs = {};
const defFor = (name) => (defs[name] ||= require(`../models/${name}`));

async function checkLinks(def, value, user) {
  const errors = [];
  for (const field of def.fields) {
    if (field.type !== "relation" || !value[field.name]) continue;
    const target = defFor(field.model);
    const scope = target.ownedByUser ? { user: user?.id } : {};
    const found = await createStore(target).get(value[field.name], scope);
    if (!found) errors.push(`The selected ${field.label.toLowerCase()} doesn't exist`);
  }
  return errors;
}

/** Turn linked ids into readable titles (used in notification emails). */
async function linkTitle(field, id) {
  try {
    const target = defFor(field.model);
    const item = await createStore(target).get(id);
    return item ? String(item[target.titleField] ?? id) : id;
  } catch {
    return id;
  }
}

module.exports = { checkLinks, linkTitle };
