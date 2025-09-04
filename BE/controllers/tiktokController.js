const axios = require('axios');
const SocialAccount = require('../models/SocialAccountModel');

// TikTok API configuration
const TIKTOK_CONFIG = {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3001/auth/tiktok/callback'
};

// Get TikTok OAuth URL
const getTikTokAuthUrl = async (req, res) => {
    try {
        const state = Math.random().toString(36).substring(7);
        const scope = 'user.info.basic,video.list,video.upload';
        
        const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${TIKTOK_CONFIG.clientKey}&scope=${scope}&response_type=code&redirect_uri=${TIKTOK_CONFIG.redirectUri}&state=${state}`;
        
        res.status(200).json({
            success: true,
            authUrl,
            state
        });
    } catch (error) {
        console.error('[TIKTOK AUTH URL ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Handle TikTok OAuth callback
const handleTikTokCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;
        const { userId } = req.body;

        if (error) {
            return res.status(400).json({ error: 'TikTok authorization failed' });
        }

        if (!code || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Exchange code for access token
        const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
            client_key: TIKTOK_CONFIG.clientKey,
            client_secret: TIKTOK_CONFIG.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: TIKTOK_CONFIG.redirectUri
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            }
        });

        const { access_token, refresh_token, open_id, union_id } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const userData = userResponse.data.data.user;
        const stats = userResponse.data.data.stats;

        // Save or update TikTok account
        const existingAccount = await SocialAccount.findOne({
            userId,
            platform: 'tiktok',
            accountId: open_id
        });

        if (existingAccount) {
            // Update existing account
            existingAccount.accessToken = access_token;
            existingAccount.refreshToken = refresh_token;
            existingAccount.tiktokAccessToken = access_token;
            existingAccount.tiktokRefreshToken = refresh_token;
            existingAccount.tiktokOpenId = open_id;
            existingAccount.tiktokUnionId = union_id;
            existingAccount.accountName = userData.display_name;
            existingAccount.followers = stats.follower_count;
            existingAccount.following = stats.following_count;
            existingAccount.posts = stats.video_count;
            existingAccount.profilePicture = userData.avatar_url_100;
            existingAccount.lastSync = new Date();
            await existingAccount.save();
        } else {
            // Create new account
            const newAccount = new SocialAccount({
                userId,
                platform: 'tiktok',
                accountType: 'personal',
                accountName: userData.display_name,
                accountId: open_id,
                accessToken: access_token,
                refreshToken: refresh_token,
                tiktokAccessToken: access_token,
                tiktokRefreshToken: refresh_token,
                tiktokOpenId: open_id,
                tiktokUnionId: union_id,
                followers: stats.follower_count,
                following: stats.following_count,
                posts: stats.video_count,
                profilePicture: userData.avatar_url_100,
                metadata: {
                    description: userData.bio_description || '',
                    location: userData.location || ''
                }
            });
            await newAccount.save();
        }

        res.status(200).json({
            success: true,
            message: 'TikTok account connected successfully',
            userData: {
                username: userData.display_name,
                followers: stats.follower_count,
                following: stats.following_count,
                videos: stats.video_count,
                likes: stats.like_count
            }
        });

    } catch (error) {
        console.error('[TIKTOK CALLBACK ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get TikTok user info
const getTikTokUserInfo = async (req, res) => {
    try {
        const { accountId } = req.params;
        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'tiktok') {
            return res.status(404).json({ error: 'TikTok account not found' });
        }

        const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: {
                'Authorization': `Bearer ${account.tiktokAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({
            success: true,
            userInfo: response.data.data
        });

    } catch (error) {
        console.error('[TIKTOK USER INFO ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user's videos
const getUserVideos = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { cursor = 0, max_count = 20 } = req.query;
        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'tiktok') {
            return res.status(404).json({ error: 'TikTok account not found' });
        }

        const response = await axios.get('https://open.tiktokapis.com/v2/video/list/', {
            headers: {
                'Authorization': `Bearer ${account.tiktokAccessToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                cursor: cursor,
                max_count: max_count
            }
        });

        res.status(200).json({
            success: true,
            videos: response.data.data.videos,
            cursor: response.data.data.cursor,
            has_more: response.data.data.has_more
        });

    } catch (error) {
        console.error('[TIKTOK VIDEOS ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Upload video to TikTok
const uploadTikTokVideo = async (req, res) => {
    try {
        const { accountId, title, privacy_level = 'SELF_ONLY' } = req.body;
        const videoFile = req.file;

        if (!videoFile) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'tiktok') {
            return res.status(404).json({ error: 'TikTok account not found' });
        }

        // Step 1: Create video upload request
        const createResponse = await axios.post('https://open.tiktokapis.com/v2/video/upload/', {
            post_info: {
                title: title,
                privacy_level: privacy_level,
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 0
            }
        }, {
            headers: {
                'Authorization': `Bearer ${account.tiktokAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const uploadUrl = createResponse.data.data.upload_url;
        const videoId = createResponse.data.data.video_id;

        // Step 2: Upload the video file
        const fs = require('fs');
        const videoBuffer = fs.readFileSync(videoFile.path);
        
        await axios.put(uploadUrl, videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4'
            }
        });

        // Step 3: Publish the video
        const publishResponse = await axios.post('https://open.tiktokapis.com/v2/video/publish/', {
            video_id: videoId
        }, {
            headers: {
                'Authorization': `Bearer ${account.tiktokAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Clean up uploaded file
        fs.unlinkSync(videoFile.path);

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            videoId: publishResponse.data.data.publish_id,
            url: `https://www.tiktok.com/@${account.accountName}/video/${publishResponse.data.data.publish_id}`
        });

    } catch (error) {
        console.error('[TIKTOK UPLOAD ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Refresh TikTok access token
const refreshTikTokToken = async (req, res) => {
    try {
        const { accountId } = req.params;
        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'tiktok') {
            return res.status(404).json({ error: 'TikTok account not found' });
        }

        const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
            client_key: TIKTOK_CONFIG.clientKey,
            client_secret: TIKTOK_CONFIG.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: account.tiktokRefreshToken
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = response.data;

        // Update account with new tokens
        account.tiktokAccessToken = access_token;
        account.tiktokRefreshToken = refresh_token;
        account.accessToken = access_token;
        account.refreshToken = refresh_token;
        await account.save();

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully'
        });

    } catch (error) {
        console.error('[TIKTOK TOKEN REFRESH ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTikTokAuthUrl,
    handleTikTokCallback,
    getTikTokUserInfo,
    getUserVideos,
    uploadTikTokVideo,
    refreshTikTokToken
};
