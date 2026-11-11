const { createStore } = require("../lib/store");

/** Sample data inserted the first time the app starts (only into empty collections). */
const SAMPLE = [
  {
    "model": "MenuItem",
    "links": [],
    "rows": [
      {
        "name": "Paneer Tikka",
        "price": 249,
        "category": "Starter",
        "vegetarian": true,
        "spicy": true,
        "description": "Cottage cheese marinated in spices and grilled in the tandoor."
      },
      {
        "name": "Butter Chicken",
        "price": 349,
        "category": "Main course",
        "vegetarian": false,
        "description": "Tender chicken in a rich tomato and butter gravy."
      },
      {
        "name": "Dal Makhani",
        "price": 229,
        "category": "Main course",
        "vegetarian": true,
        "description": "Black lentils slow-cooked overnight with cream."
      },
      {
        "name": "Gulab Jamun",
        "price": 119,
        "category": "Dessert",
        "vegetarian": true,
        "description": "Soft milk dumplings in warm rose syrup."
      },
      {
        "name": "Masala Chai",
        "price": 49,
        "category": "Drinks",
        "vegetarian": true,
        "description": "Spiced tea brewed with milk."
      }
    ]
  }
];

async function seed() {
  for (const { model, rows, links } of SAMPLE) {
    const store = createStore(require(`../models/${model}`));
    if ((await store.count()) > 0) continue;
    for (const sample of rows) {
      const row = { ...sample };
      // Sample links name the linked item by its title; store its id instead.
      for (const link of links) {
        if (!row[link.field]) continue;
        const target = await createStore(require(`../models/${link.model}`)).findOne({ [link.titleField]: row[link.field] });
        if (target) row[link.field] = String(target._id);
        else delete row[link.field];
      }
      await store.create(row);
    }
    console.log(`🌱 Added ${rows.length} sample ${model} records`);
  }
}

module.exports = { seed };
