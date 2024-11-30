require("dotenv").config(); 
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("flightTracker"); // make sure the name same as the database
    console.log("Using database:", db.databaseName);
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

module.exports = connectDB;
