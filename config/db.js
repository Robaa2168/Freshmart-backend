// config/db.js
require("dotenv").config()
const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI in environment variables")
    }

    await mongoose.connect(process.env.MONGO_URI)

    console.log("mongodb connection success!")
  } catch (err) {
    console.log("mongodb connection failed!", err.message)
    process.exitCode = 1
  }
}

module.exports = { connectDB }
