const express = require('express');
const router = express.Router();
const tiktokController = require('../controllers/tiktokController');
const multer = require('multer');

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/tiktok');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// TikTok OAuth routes
router.get('/auth/url', tiktokController.getTikTokAuthUrl);
router.post('/auth/callback', tiktokController.handleTikTokCallback);

// TikTok user and account management
router.get('/user/:accountId', tiktokController.getTikTokUserInfo);
router.get('/videos/:accountId', tiktokController.getUserVideos);

// TikTok video upload
router.post('/upload', upload.single('video'), tiktokController.uploadTikTokVideo);

// Token management
router.post('/refresh-token/:accountId', tiktokController.refreshTikTokToken);

module.exports = router;
