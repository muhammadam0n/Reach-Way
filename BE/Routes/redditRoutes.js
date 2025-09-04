const express = require('express');
const router = express.Router();
const redditController = require('../controllers/redditController');

// Reddit OAuth routes
router.get('/auth/url', redditController.getRedditAuthUrl);
router.post('/auth/callback', redditController.handleRedditCallback);

// Reddit user and account management
router.get('/user/:accountId', redditController.getRedditUserInfo);
router.get('/subreddits/:accountId', redditController.getUserSubreddits);

// Reddit posting
router.post('/post', redditController.postToReddit);

// Devvit integration
router.post('/devvit/create-app', redditController.createDevvitApp);

module.exports = router;
