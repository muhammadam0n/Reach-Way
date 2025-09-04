const express = require("express");
const router = express.Router();
const {
    getMultiPlatformDashboard,
    getPlatformInsights,
    getAccountInsights,
    syncPlatformInsights
} = require("../controllers/dashboardController");

// Dashboard routes
router.get("/multi-platform", getMultiPlatformDashboard);
router.get("/platform", getPlatformInsights);
router.get("/account/:accountId", getAccountInsights);
router.post("/sync-insights", syncPlatformInsights);

module.exports = router;
