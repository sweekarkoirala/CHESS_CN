const mongoose = require('mongoose');

async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Database connected successfully");
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);

  }
}

module.exports = connectDB;