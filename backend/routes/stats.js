const express = require("express");
const { createStore } = require("../lib/store");
const { requireAdmin } = require("../middleware/auth");

/** GET /api/stats — numbers for the admin dashboard. */
const router = express.Router();
const MODELS = [
  {
    "name": "MenuItem",
    "key": "menuItems",
    "label": "Menu",
    "icon": "🍽️",
    "recent": false,
    "payments": false
  },
  {
    "name": "Reservation",
    "key": "reservations",
    "label": "Book a table",
    "icon": "📅",
    "recent": true,
    "payments": false
  }
];
const day = (d) => new Date(d).toISOString().slice(0, 10);

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const today = day(Date.now());
    const days = [...Array(14)].map((_, i) => day(Date.now() - (13 - i) * 86400000));
    const out = [];
    for (const m of MODELS) {
      const def = require(`../models/${m.name}`);
      const rows = await createStore(def).list({});
      const perDay = Object.fromEntries(days.map((d) => [d, 0]));
      for (const r of rows) if (r.createdAt && perDay[day(r.createdAt)] !== undefined) perDay[day(r.createdAt)]++;
      const pay = m.payments
        ? {
            received: rows.filter((r) => r.paymentStatus === "paid").reduce((n, r) => n + (Number(r.amount) || 0), 0),
            toVerify: rows.filter((r) => r.paymentStatus === "verifying").length,
            unpaid: rows.filter((r) => r.paymentStatus === "unpaid").length,
          }
        : null;
      out.push({
        ...m,
        pay,
        total: rows.length,
        today: perDay[today] || 0,
        last14: days.map((d) => ({ day: d, count: perDay[d] })),
        recentItems: m.recent && !def.ownedByUser
          ? rows.slice(0, 5).map((r) => ({ _id: r._id, title: r[def.titleField], reference: r.reference, amount: r.amount, paymentStatus: r.paymentStatus, createdAt: r.createdAt }))
          : [],
      });
    }
    res.json({ models: out });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
