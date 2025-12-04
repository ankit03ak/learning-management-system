const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(`${DB}`);
    console.log("MongoDB Connected !!!");
  } catch (error) {
    console.log("MongoDB connection error", error);
  }
};

module.exports =  connectDB;
