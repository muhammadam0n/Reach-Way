const express = require("express");
const router = express.Router();
const { savePost, getPosts } = require("../controllers/postController");

router.post("/save-post", savePost);
router.get("/posts", getPosts);

module.exports = router;