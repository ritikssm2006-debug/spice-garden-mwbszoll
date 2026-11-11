const mongoose = require("mongoose");

/**
 * Reservation (Book a table)
 * Field definitions are also used for request validation (lib/validate.js)
 * and by the in-memory database when MongoDB isn't configured.
 */
const fields = [
  {
    "name": "name",
    "label": "Name",
    "type": "text",
    "required": true
  },
  {
    "name": "phone",
    "label": "Phone",
    "type": "phone",
    "required": true
  },
  {
    "name": "date",
    "label": "Date",
    "type": "date",
    "required": true
  },
  {
    "name": "time",
    "label": "Time",
    "type": "time",
    "required": true
  },
  {
    "name": "guests",
    "label": "Guests",
    "type": "number",
    "required": true
  },
  {
    "name": "notes",
    "label": "Notes",
    "type": "textarea",
    "required": false
  }
];

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    guests: { type: Number, required: true },
    notes: { type: String, trim: true },
    // added by the server, not the form:
    reference: { type: String, index: true },
    accessKey: { type: String },
    userId: { type: String, index: true },
    customerId: { type: String },
    customerEmail: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  name: "Reservation",
  key: "reservations",
  label: "Book a table",
  singular: "Reservation",
  titleField: "name",
  priceField: null,
  // Who may view the list / add new ones / edit & delete: "public", "user" (own only) or "admin"
  access: {
  "list": "admin",
  "create": "public",
  "manage": "admin"
},
  // A form visitors submit: gets a reference like RES-7K2Q9X, alerts and tracking
  submission: true,
  // must the visitor be logged in to submit? (the contact form never needs it)
  loginRequired: true,
  prefix: "RES",
  notify: true,
  // How the payment amount is worked out (null = no payment)
  payment: null,
  fields,
  searchFields: [
  "name",
  "phone",
  "notes"
],
  ownedByUser: false,
  newestFirst: true,
  Model: mongoose.models["Reservation"] || mongoose.model("Reservation", schema),
};
