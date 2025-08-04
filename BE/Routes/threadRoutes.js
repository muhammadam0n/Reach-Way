const express = require("express");
const { createPost } = require("../controllers/ThreadController.js");
const router = express.Router();


router.post("/post-thread", createPost);
module.exports=router;