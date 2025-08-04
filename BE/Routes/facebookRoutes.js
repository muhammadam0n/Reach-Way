const express = require("express");
const { createPost } = require("../controllers/facebookController");
const router = express.Router();

router.post("/social-media/save-post", createPost);

module.exports = router;