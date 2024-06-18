//
//
const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate.js");
const { jwtAuthMiddleware } = require("../jwt.js");
const User = require("../models/user.js");

// check candidate role
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (error) {
    return false;
  }
};

//
// POST method -- add a new candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user does not have admin role" });
    }
    // assuming the request body contains the Candidate data
    const data = req.body;
    // create a new Candidate document using the Mongoose model
    const newCandidate = new Candidate(data);
    // save the newCandidate to the database
    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (error) {
    console.error("Error saving candidate: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//
// PUT method -- update / change the user password
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user does not have admin role" });
    }
    const candidateID = req.params.candidateID; //extract the id from the url parameter
    const updateCandidateData = req.body; //update data for the person

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updateCandidateData,
      {
        new: true, //return the updated document
        runValidators: true, //run mongoose validation
      }
    );
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

//
// DELETE method -- change the user password
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user does not have admin role" });
    }
    const candidateID = req.params.candidateID; //extract the id from the url parameter

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    console.log("candidate deleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

//
// POST method -- let's start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  // no admin can vote
  // user can only vote once
  const candidateID = req.params.candidateID;
  const userId = req.user.id;
  try {
    // find the Candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.isVoted) {
      res.status(400).json({ message: "user have already voted" });
    }
    if (user.role === "admin") {
      res.status(403).json({ message: "admin isn't allowed to vote" });
    }
    // update the candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();
    // update the user document
    user.isVoted = true;
    user.save();
    res.status(200).json({ message: "user vote recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

//
// GET method -- vote count
router.get("/vote/count", async (req, res) => {
  try {
    // find all the candidate and sort them by voteCount in desending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    // map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);
    res.Status(500).json({ message: "internal server error" });
  }
});

//
// GET method -- get the candidate list
router.get("/candidate", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");
    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (error) {
    console.log(error);
  }
});
//
//
module.exports = router;
