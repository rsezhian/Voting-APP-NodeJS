//
//
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { jwtAuthMiddleware, generateToken } = require("../jwt.js");

//
// POST method -- signup / create a new User
router.post("/signup", async (req, res) => {
  try {
    // assuming the request body contains the User data
    const data = req.body;
    // create a new User document using the Mongoose model
    const newUser = new User(data);
    // save the newUser to the database
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));

    const token = generateToken(payload);
    console.log(`Token is: ${token}`);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.error("Error saving user: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//
// POST method -- login a User
router.post("/login", async (req, res) => {
  try {
    // extract aadharCardNumber and password from request
    const { aadharCardNumber, password } = req.body;
    // find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    // if user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid username or password" });
    }
    // generate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    // return token as response
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

//
// GET method -- profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    console.log("User Data: ", userData);
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

//
// PUT method -- change the user password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; //extract the id from the token
    const { currentPassword, newPassword } = req.body; //extract the currentPassword and newPassword from request body

    // find the user by userId
    const user = await User.findById(userId);

    // if password does not match, return error
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    // update the user's password
    user.password = newPassword;
    await user.save();

    console.log("new password updated");
    res.status(200).json({ message: "new password updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

//
//
module.exports = router;
