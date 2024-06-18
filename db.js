//
//
//
const mongoose = require("mongoose");
require("dotenv").config();

// define the MongoDB connection URL
const mongoURL = process.env.MONGODB_URL_LOCAL;
// const mongoURL = "mongodb://localhost:27017/myhotels";
//replace 'mydatabase' with your database name

// set up mongoDB connection
mongoose.connect(mongoURL);

// get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection;

// define event listeners for database connection
db.on("connected", () => {
  console.log("Connected to MongoDB server");
});

db.on("error", (err) => {
  console.log("MongoDB Connection error", err);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// export the database connection
module.exports = db;

//
//
//
//
//
//
//
// deprecated below options
// , {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
