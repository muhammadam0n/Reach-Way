const express = require("express");
const router = express.Router();
const {
    postToMultiplePlatforms,
    getUserSocialAccounts,
    addSocialAccount,
    updateSocialAccount,
    deleteSocialAccount,
    testAccountConnection
} = require("../controllers/multiPlatformController");

// Multi-platform posting
router.post("/post", postToMultiplePlatforms);

// Social account management
router.get("/accounts/:userId", getUserSocialAccounts);
router.post("/accounts", addSocialAccount);
router.put("/accounts/:accountId", updateSocialAccount);
router.delete("/accounts/:accountId", deleteSocialAccount);

// Account testing
router.post("/accounts/:accountId/test", testAccountConnection);

module.exports = router;
