/**
 * API for Menu: /api/menuItems
 * All the rules (who can see, add and edit; reference numbers; payments;
 * email and WhatsApp alerts) are in lib/crud.js and models/MenuItem.js.
 */
module.exports = require("../lib/crud")(require("../models/MenuItem"));
