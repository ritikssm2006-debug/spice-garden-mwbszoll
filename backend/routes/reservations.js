/**
 * API for Book a table: /api/reservations
 * All the rules (who can see, add and edit; reference numbers; payments;
 * email and WhatsApp alerts) are in lib/crud.js and models/Reservation.js.
 */
module.exports = require("../lib/crud")(require("../models/Reservation"));
