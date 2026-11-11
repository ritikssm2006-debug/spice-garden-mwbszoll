const mongoose = require("mongoose");

let mongo = false;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("⚠️  MONGO_URI not set: using the in-memory database (data resets on restart).");
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    mongo = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️  Falling back to the in-memory database.");
  }
}

module.exports = { connectDB, usingMongo: () => mongo };
