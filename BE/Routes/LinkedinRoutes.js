const express = require("express");
const router = express.Router();
const {LinkedinPost, postToLinkedIn, getLinkedInProfile, getLinkedInToken} = require("../controllers/LinkedinController");

router.post("/uploadLinkedInImage", LinkedinPost);
router.post("/postToLinkedIn", postToLinkedIn);
router.get("/getUserProfile", getLinkedInProfile);
router.post("/getLinkedInToken", getLinkedInToken);
  
module.exports = router;