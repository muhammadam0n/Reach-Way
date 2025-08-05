const express = require("express");
const router = express.Router();
const { savePost, getPosts, getFbPagePostsService } = require("../controllers/postController");

router.post("/save-post", savePost);
router.get("/posts", getPosts);
router.get("/fetch-fb-posts-insights", getFbPagePostsService)

module.exports = router;