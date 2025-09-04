const express = require("express");
const router = express.Router();
const { 
    savePost, 
    getPosts, 
    getFbPagePostsService,
    getPostAnalytics,
    getAllPostsAnalytics,
    getAnalyticsDashboard,
    updatePostAnalytics,
    syncAllPostsAnalytics,
    syncPostAnalytics
} = require("../controllers/postController");

router.post("/save-post", savePost);
router.get("/posts", getPosts);
router.get("/fetch-fb-posts-insights", getFbPagePostsService);

// New Analytics Routes
router.get("/analytics/post/:postId", getPostAnalytics);
router.get("/analytics/posts", getAllPostsAnalytics);
router.get("/analytics/dashboard", getAnalyticsDashboard);
router.put("/analytics/post/:postId", updatePostAnalytics);

// Analytics Sync Routes
router.post("/analytics/sync/all", syncAllPostsAnalytics);
router.post("/analytics/sync/post/:postId", syncPostAnalytics);

module.exports = router;