require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, usingMongo } = require("./config/db");
const { seed } = require("./data/seed");

const app = express();
app.set("trust proxy", 1); // correct visitor IPs behind Render's proxy (for rate limits)

// CORS_ORIGIN can limit which sites may call the API (comma-separated).
const origins = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : {}));
app.use(express.json({ limit: "4mb" })); // room for uploaded images

app.get("/", (req, res) => res.json({ name: "Spice Garden", health: "/api/health" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", database: usingMongo() ? "mongodb" : "memory" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/menuItems", require("./routes/menuItems"));
app.use("/api/reservations", require("./routes/reservations"));

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await require("./routes/auth").seedAdmin();
  await seed();
  app.listen(PORT, () => console.log(`✅ Spice Garden API running on port ${PORT}`));
})();
