require("dotenv").config();
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;

const connectDB = async () => {
  console.log("DB URL:", dbUrl);
  await mongoose.connect(dbUrl);
};

module.exports = connectDB;
