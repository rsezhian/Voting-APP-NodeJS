//
//
const express = require("express");
const app = express();
const db = require("./db.js");
require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.json()); //req.body
const PORT = process.env.PORT || 3001;

const { jwtAuthMiddleware } = require("./jwt.js");

// import the router files
const userRoutes = require("./routes/userRoutes.js");
const candidateRoutes = require("./routes/candidateRoutes.js");

//
// home route
app.get("/", (req, res) => {
  res.send(
    "<h1 style='background-color:powderblue;padding:15px;text-align:center'>VOTING APP REST API Using NodeJS</h1>"
  );
});

//
// use the routers
app.use("/api/user", userRoutes);
app.use("/api/candidate", jwtAuthMiddleware, candidateRoutes);

//
//
app.listen(PORT, () => {
  console.log(`SERVER is listening on port ${PORT}`);
});
