const mongoose = require("mongoose");

/**
 * Menu item (Menu)
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
    "name": "price",
    "label": "Price",
    "type": "price",
    "required": true
  },
  {
    "name": "category",
    "label": "Category",
    "type": "select",
    "required": false,
    "options": [
      "Starter",
      "Main course",
      "Dessert",
      "Drinks"
    ]
  },
  {
    "name": "vegetarian",
    "label": "Vegetarian",
    "type": "boolean",
    "required": false
  },
  {
    "name": "spicy",
    "label": "Spicy",
    "type": "boolean",
    "required": false
  },
  {
    "name": "description",
    "label": "Description",
    "type": "textarea",
    "required": false
  },
  {
    "name": "image",
    "label": "Image",
    "type": "image",
    "required": false
  }
];

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, trim: true, enum: ["Starter","Main course","Dessert","Drinks"] },
    vegetarian: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = {
  name: "MenuItem",
  key: "menuItems",
  label: "Menu",
  singular: "Menu item",
  titleField: "name",
  priceField: "price",
  // Who may view the list / add new ones / edit & delete: "public", "user" (own only) or "admin"
  access: {
  "list": "public",
  "create": "admin",
  "manage": "admin"
},
  // A form visitors submit: gets a reference like MEN-7K2Q9X, alerts and tracking
  submission: false,
  // must the visitor be logged in to submit? (the contact form never needs it)
  loginRequired: false,
  prefix: "MEN",
  notify: false,
  // How the payment amount is worked out (null = no payment)
  payment: null,
  fields,
  searchFields: [
  "name",
  "category",
  "description"
],
  ownedByUser: false,
  newestFirst: false,
  Model: mongoose.models["MenuItem"] || mongoose.model("MenuItem", schema),
};
