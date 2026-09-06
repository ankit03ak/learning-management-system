const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB = process.env.MONGO_URL;

const connectDB = async () => {
  if (!DB || typeof DB !== "string") {
    throw new Error("MONGO_URL is required");
  }

  await mongoose.connect(DB, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
    connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000,
  });
  console.log("MongoDB Connected !!!");
};

module.exports = connectDB;
