const SocialAccount = require("../models/SocialAccountModel");
const Post = require("../models/PostModel");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, 'uploads/posts');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, fieldSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isImage = /jpeg|jpg|png|gif/.test(file.mimetype);
        if (file.fieldname === "image" && isImage) {
            cb(null, true);
        } else {
            cb(new Error("Only images (JPEG, JPG, PNG, GIF) are allowed"));
        }
    },
}).single("image");

// Multi-platform posting function
const postToMultiplePlatforms = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(500).json({ message: "File size exceeds 10MB limit" });
            }
            return res.status(400).json({ message: "File upload error: " + err.message });
        } else if (err) {
            return res.status(400).json({ message: "Error: " + err.message });
        }

        try {
            const { 
                userId, 
                description, 
                selectedAccounts, 
                scheduledDateTime,
                postType = "post"
            } = req.body;

            if (!userId || !selectedAccounts || !description) {
                return res.status(400).json({ 
                    error: "Missing required fields: userId, selectedAccounts, description" 
                });
            }

            const image = req.file;
            const accounts = JSON.parse(selectedAccounts);
            
            if (!Array.isArray(accounts) || accounts.length === 0) {
                return res.status(400).json({ 
                    error: "No accounts selected for posting" 
                });
            }

            const results = {
                success: [],
                failed: [],
                totalAccounts: accounts.length
            };

            // Process each selected account
            for (const accountInfo of accounts) {
                try {
                    const { accountId, platform } = accountInfo;
                    
                    // Get account details
                    const account = await SocialAccount.findOne({
                        _id: accountId,
                        userId: userId,
                        platform: platform,
                isActive: true
            });

                    if (!account) {
                        results.failed.push({
                            platform,
                            accountName: accountInfo.accountName || 'Unknown',
                            error: 'Account not found or inactive'
                        });
                        continue;
                    }

                    // Post to specific platform
                    const postResult = await postToPlatform(account, description, image, scheduledDateTime);

                    if (postResult.success) {
                        // Save post to database
                        const newPost = new Post({
                            userId,
                            platform,
                            description,
                            image: image?.path || "",
                            date: scheduledDateTime ? new Date(scheduledDateTime) : new Date(),
                            status: postResult.scheduled ? "post" : "posted",
                            socialMediaPostId: postResult.postId,
                            mediaId: postResult.mediaId,
                            scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : null,
                            accountId: accountId
                        });

                        await newPost.save();

                        results.success.push({
                            platform,
                            accountName: account.accountName,
                            postId: postResult.postId,
                            scheduled: postResult.scheduled
                        });
                    } else {
                        results.failed.push({
                            platform,
                            accountName: account.accountName,
                            error: postResult.error
                        });
                    }

                } catch (error) {
                    console.error(`[ERROR POSTING TO ACCOUNT ${accountInfo.accountId}]:`, error);
                    results.failed.push({
                        platform: accountInfo.platform,
                        accountName: accountInfo.accountName || 'Unknown',
                        error: error.message
                    });
                }
            }

            // Clean up uploaded image
            if (image?.path && fs.existsSync(image.path)) {
                try {
                    await fs.promises.unlink(image.path);
                } catch (cleanupError) {
                    console.error("[ERROR CLEANING UP IMAGE]:", cleanupError);
                }
            }

            res.status(200).json({
                success: true,
                message: `Posted to ${results.success.length} out of ${results.totalAccounts} accounts`,
                results
            });

        } catch (error) {
            console.error("[ERROR IN MULTI-PLATFORM POSTING]:", error);
            res.status(500).json({ 
                error: "Failed to post to multiple platforms",
                details: error.message 
            });
        }
    });
};

// Platform-specific posting functions
const postToPlatform = async (account, description, image, scheduledDateTime) => {
    try {
        switch (account.platform) {
            case 'facebook':
                return await postToFacebook(account, description, image, scheduledDateTime);
            case 'instagram':
                return await postToInstagram(account, description, image, scheduledDateTime);
            case 'linkedin':
                return await postToLinkedIn(account, description, image, scheduledDateTime);
            case 'twitter':
                return await postToTwitter(account, description, image, scheduledDateTime);
            case 'tiktok':
                return await postToTikTok(account, description, image, scheduledDateTime);
            case 'reddit':
                return await postToReddit(account, description, image, scheduledDateTime);
            default:
                return { success: false, error: `Unsupported platform: ${account.platform}` };
        }
    } catch (error) {
        console.error(`[ERROR POSTING TO ${account.platform}]:`, error);
        return { success: false, error: error.message };
    }
};

// Facebook posting
const postToFacebook = async (account, description, image, scheduledDateTime) => {
    try {
        const accessToken = account.pageAccessToken || account.accessToken;
        const pageId = account.pageId || account.accountId;

        if (!accessToken) {
            return { success: false, error: "No access token available" };
        }

        let mediaId = null;
        if (image?.path) {
            try {
                // Upload image to Facebook using proper FormData
                const form = new FormData();
                const imageStream = fs.createReadStream(image.path);
                form.append('source', imageStream);
                form.append('published', 'false');

                const uploadResponse = await axios.post(
                    `https://graph.facebook.com/v19.0/${pageId}/photos`,
                    form,
                    {
                        params: { access_token: accessToken },
                        headers: { 
                            ...form.getHeaders(),
                            'Content-Type': 'multipart/form-data'
                        },
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );
                
                if (uploadResponse.data && uploadResponse.data.id) {
                    mediaId = uploadResponse.data.id;
                    console.log("[FACEBOOK IMAGE UPLOAD SUCCESS]:", mediaId);
                } else {
                    console.error("[FACEBOOK IMAGE UPLOAD FAILED]:", uploadResponse.data);
                    return { success: false, error: "Failed to upload image to Facebook" };
                }
            } catch (uploadError) {
                console.error("[FACEBOOK IMAGE UPLOAD ERROR]:", uploadError.response?.data || uploadError);
                return { success: false, error: "Image upload failed: " + (uploadError.response?.data?.error?.message || uploadError.message) };
            }
        }

        const postData = {
            message: description,
            ...(mediaId && { attached_media: `[{"media_fbid":"${mediaId}"}]` })
        };

        if (scheduledDateTime) {
            const scheduleTime = Math.floor(new Date(scheduledDateTime).getTime() / 1000);
            postData.published = false;
            postData.scheduled_publish_time = scheduleTime;
        } else {
            postData.published = true;
        }

        console.log("[FACEBOOK POST DATA]:", postData);

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/feed`,
            postData,
            { params: { access_token: accessToken } }
        );

        return {
            success: true,
            postId: response.data.id,
            mediaId: mediaId,
            scheduled: !!scheduledDateTime
        };

    } catch (error) {
        console.error("[FACEBOOK POSTING ERROR]:", error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

// Instagram posting
const postToInstagram = async (account, description, image, scheduledDateTime) => {
    try {
        if (!image?.path) {
            return { success: false, error: "Instagram requires an image" };
        }

        const accessToken = account.accessToken;
        const instagramAccountId = account.instagramBusinessAccountId;

        if (!accessToken || !instagramAccountId) {
            return { success: false, error: "Missing Instagram credentials" };
        }

        try {
            // Upload image to Cloudinary first for better reliability
            const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
                folder: 'instagram_posts',
                resource_type: 'auto',
                quality: 'auto',
                fetch_format: 'auto'
            });

            console.log("[INSTAGRAM CLOUDINARY UPLOAD SUCCESS]:", cloudinaryResult.secure_url);

            // Create media container
            const mediaResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
                {
                    image_url: cloudinaryResult.secure_url,
                    caption: description,
                    published: !scheduledDateTime
                },
                { params: { access_token: accessToken } }
            );

            if (!mediaResponse.data?.id) {
                throw new Error("Failed to create Instagram media container");
            }

            const mediaId = mediaResponse.data.id;
            console.log("[INSTAGRAM MEDIA CONTAINER CREATED]:", mediaId);

            if (scheduledDateTime) {
                // Schedule the post
                const publishResponse = await axios.post(
                    `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
                    {
                        creation_id: mediaId,
                        scheduled_publish_time: Math.floor(new Date(scheduledDateTime).getTime() / 1000)
                    },
                    { params: { access_token: accessToken } }
                );

                return {
                    success: true,
                    postId: publishResponse.data.id,
                    mediaId: mediaId,
                    scheduled: true,
                    imageUrl: cloudinaryResult.secure_url
                };
            } else {
                // Publish immediately
                const publishResponse = await axios.post(
                    `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
                    { creation_id: mediaId },
                    { params: { access_token: accessToken } }
                );

                return {
                    success: true,
                    postId: publishResponse.data.id,
                    mediaId: mediaId,
                    scheduled: false,
                    imageUrl: cloudinaryResult.secure_url
                };
            }
        } catch (imageError) {
            console.error("[INSTAGRAM IMAGE PROCESSING ERROR]:", imageError.response?.data || imageError);
            return { success: false, error: "Image processing failed: " + (imageError.response?.data?.error?.message || imageError.message) };
        }

    } catch (error) {
        console.error("[INSTAGRAM POSTING ERROR]:", error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

// LinkedIn posting
const postToLinkedIn = async (account, description, image, scheduledDateTime) => {
    try {
        const accessToken = account.accessToken;
        const companyId = account.linkedinCompanyId || account.accountId;

        if (!accessToken) {
            return { success: false, error: "No access token available" };
        }

        // LinkedIn API endpoint for company posts
        const endpoint = `https://api.linkedin.com/v2/organizations/${companyId}/shares`;

        const postData = {
            author: `urn:li:organization:${companyId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: description
                    },
                    shareMediaCategory: image?.path ? "IMAGE" : "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        if (image?.path) {
            try {
                // Step 1: Register upload
                const imageUploadResponse = await axios.post(
                    `https://api.linkedin.com/v2/assets?action=registerUpload`,
                    {
                        registerUploadRequest: {
                            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                            owner: `urn:li:organization:${companyId}`,
                            serviceRelationships: [{
                                relationshipType: "OWNER",
                                identifier: "urn:li:userGeneratedContent"
                            }]
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            'X-Restli-Protocol-Version': '2.0.0'
                        }
                    }
                );

                if (!imageUploadResponse.data?.value) {
                    throw new Error("Failed to register upload with LinkedIn");
                }

                const uploadUrl = imageUploadResponse.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                const asset = imageUploadResponse.data.value.asset;

                // Step 2: Upload the actual image
                const imageBuffer = fs.readFileSync(image.path);
                const uploadResponse = await axios.put(uploadUrl, imageBuffer, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'image/jpeg'
                    }
                });

                if (uploadResponse.status !== 200) {
                    throw new Error("Failed to upload image to LinkedIn");
                }

                // Step 3: Update post data with media
                postData.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "IMAGE";
                postData.specificContent["com.linkedin.ugc.ShareContent"].media = [{
                    status: "READY",
                    description: {
                        text: "Image"
                    },
                    media: asset,
                    title: {
                        text: "Image"
                    }
                }];

                console.log("[LINKEDIN IMAGE UPLOAD SUCCESS]:", asset);
            } catch (imageError) {
                console.error("[LINKEDIN IMAGE UPLOAD ERROR]:", imageError.response?.data || imageError);
                // Continue without image if upload fails
                postData.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "NONE";
            }
        }

        console.log("[LINKEDIN POST DATA]:", postData);

        const response = await axios.post(endpoint, postData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        return {
            success: true,
            postId: response.data.id,
            mediaId: null,
            scheduled: false
        };

    } catch (error) {
        console.error("[LINKEDIN POSTING ERROR]:", error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.message || error.message 
        };
    }
};

// Twitter posting (placeholder - requires Twitter API v2)
const postToTwitter = async (account, description, image, scheduledDateTime) => {
    try {
        // Twitter API v2 implementation would go here
        // This is a placeholder for future implementation
        return { 
            success: false, 
            error: "Twitter posting not yet implemented" 
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// TikTok posting
const postToTikTok = async (account, description, image, scheduledDateTime) => {
    try {
        const accessToken = account.tiktokAccessToken || account.accessToken;
        const openId = account.tiktokOpenId;

        if (!accessToken || !openId) {
            return { success: false, error: "Missing TikTok credentials" };
        }

        if (!image?.path) {
            return { success: false, error: "TikTok requires a video or image" };
        }

        // TikTok API v2 implementation
        // Note: TikTok API requires special approval and has strict requirements
        const tiktokApiUrl = 'https://open.tiktokapis.com/v2/video/upload/';
        
        // Create video upload request
        const uploadResponse = await axios.post(tiktokApiUrl, {
            post_info: {
                title: description,
                privacy_level: "SELF_ONLY", // or "PUBLIC", "MUTUAL_FOLLOW_FRIENDS"
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 0
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const uploadUrl = uploadResponse.data.data.upload_url;
        const videoId = uploadResponse.data.data.video_id;

        // Upload the video file
        const videoBuffer = fs.readFileSync(image.path);
        await axios.put(uploadUrl, videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4'
            }
        });

        // Publish the video
        const publishResponse = await axios.post(
            `https://open.tiktokapis.com/v2/video/publish/`,
            {
                video_id: videoId
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            postId: publishResponse.data.data.publish_id,
            mediaId: videoId,
            scheduled: false
        };

    } catch (error) {
        console.error("[TIKTOK POSTING ERROR]:", error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

// Reddit posting
const postToReddit = async (account, description, image, scheduledDateTime) => {
    try {
        const accessToken = account.accessToken;
        const clientId = account.redditClientId;
        const username = account.redditUsername;

        if (!accessToken || !clientId || !username) {
            return { success: false, error: "Missing Reddit credentials" };
        }

        // Reddit API implementation
        const subreddit = account.redditSubreddits?.[0]?.name || 'test'; // Default to test subreddit
        
        let postData = {
            sr: subreddit,
            title: description.substring(0, 300), // Reddit title limit
            text: description,
            kind: 'self'
        };

        if (image?.path) {
            // Upload image to Reddit
            const imageBuffer = fs.readFileSync(image.path);
            const imageResponse = await axios.post(
                'https://oauth.reddit.com/api/upload_sr_img',
                imageBuffer,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': 'Reach-Way/1.0',
                        'Content-Type': 'image/jpeg'
                    },
                    params: {
                        sr: subreddit,
                        name: 'image'
                    }
                }
            );

            // Create image post
            postData = {
                sr: subreddit,
                title: description.substring(0, 300),
                url: imageResponse.data.img_src,
                kind: 'image'
            };
        }

        const response = await axios.post(
            'https://oauth.reddit.com/api/submit',
            postData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'Reach-Way/1.0',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data.json?.errors?.length > 0) {
            throw new Error(response.data.json.errors[0][1]);
        }

        return {
            success: true,
            postId: response.data.json.data.id,
            mediaId: null,
            scheduled: false
        };

    } catch (error) {
        console.error("[REDDIT POSTING ERROR]:", error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// Get user's social accounts
const getUserSocialAccounts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const accounts = await SocialAccount.find({ 
            userId: userId, 
            isActive: true 
        }).select('-accessToken -refreshToken -pageAccessToken');

        res.status(200).json({
            success: true,
            accounts: accounts
        });

    } catch (error) {
        console.error("[ERROR FETCHING SOCIAL ACCOUNTS]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Add new social account
const addSocialAccount = async (req, res) => {
    try {
        const {
            userId,
            platform,
            accountType,
            accountName,
            accountId,
            accessToken,
            pageId,
            pageAccessToken,
            instagramBusinessAccountId,
            linkedinCompanyId
        } = req.body;

        if (!userId || !platform || !accountType || !accountName || !accountId || !accessToken) {
            return res.status(400).json({ 
                error: "Missing required fields" 
            });
        }

        // Check if account already exists
        const existingAccount = await SocialAccount.findOne({
            userId: userId,
            platform: platform,
            accountId: accountId
        });

        if (existingAccount) {
            return res.status(400).json({ 
                error: "Account already exists for this platform" 
            });
        }

        const newAccount = new SocialAccount({
            userId,
            platform,
            accountType,
            accountName,
            accountId,
            accessToken,
            pageId,
            pageAccessToken,
            instagramBusinessAccountId,
            linkedinCompanyId
        });

        await newAccount.save();

        // Remove sensitive data before sending response
        const accountResponse = newAccount.toObject();
        delete accountResponse.accessToken;
        delete accountResponse.refreshToken;
        delete accountResponse.pageAccessToken;

        res.status(201).json({
            success: true,
            message: "Social account added successfully",
            account: accountResponse
        });

    } catch (error) {
        console.error("[ERROR ADDING SOCIAL ACCOUNT]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update social account
const updateSocialAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.accessToken;
        delete updateData.refreshToken;
        delete updateData.pageAccessToken;

        const updatedAccount = await SocialAccount.findByIdAndUpdate(
            accountId,
            updateData,
            { new: true }
        ).select('-accessToken -refreshToken -pageAccessToken');

        if (!updatedAccount) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.status(200).json({
            success: true,
            message: "Account updated successfully",
            account: updatedAccount
        });

    } catch (error) {
        console.error("[ERROR UPDATING SOCIAL ACCOUNT]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete social account
const deleteSocialAccount = async (req, res) => {
    try {
        const { accountId } = req.params;

        const deletedAccount = await SocialAccount.findByIdAndDelete(accountId);

        if (!deletedAccount) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("[ERROR DELETING SOCIAL ACCOUNT]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Test account connection
const testAccountConnection = async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await SocialAccount.findById(accountId);
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        let testResult = { success: false, message: "" };

        switch (account.platform) {
            case 'facebook':
                testResult = await testFacebookConnection(account);
                break;
            case 'instagram':
                testResult = await testInstagramConnection(account);
                break;
            case 'linkedin':
                testResult = await testLinkedInConnection(account);
                break;
            case 'tiktok':
                testResult = await testTikTokConnection(account);
                break;
            case 'reddit':
                testResult = await testRedditConnection(account);
                break;
            default:
                testResult = { success: false, message: "Platform not supported for testing" };
        }

        res.status(200).json({
            success: true,
            testResult
        });

    } catch (error) {
        console.error("[ERROR TESTING ACCOUNT CONNECTION]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Test Facebook connection
const testFacebookConnection = async (account) => {
    try {
        const accessToken = account.pageAccessToken || account.accessToken;
        const pageId = account.pageId || account.accountId;

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,fan_count&access_token=${accessToken}`
        );

        return {
            success: true,
            message: "Connection successful",
            data: {
                pageName: response.data.name,
                followers: response.data.fan_count
            }
        };

    } catch (error) {
        return {
            success: false,
            message: "Connection failed",
            error: error.response?.data?.error?.message || error.message
        };
    }
};

// Test Instagram connection
const testInstagramConnection = async (account) => {
    try {
        const accessToken = account.accessToken;
        const instagramId = account.instagramBusinessAccountId;

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${instagramId}?fields=id,username,media_count&access_token=${accessToken}`
        );

        return {
            success: true,
            message: "Connection successful",
            data: {
                username: response.data.username,
                mediaCount: response.data.media_count
            }
        };

    } catch (error) {
        return {
            success: false,
            message: "Connection failed",
            error: error.response?.data?.error?.message || error.message
        };
    }
};

// Test LinkedIn connection
const testLinkedInConnection = async (account) => {
    try {
        const accessToken = account.accessToken;
        const companyId = account.linkedinCompanyId || account.accountId;

        const response = await axios.get(
            `https://api.linkedin.com/v2/organizations/${companyId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            message: "Connection successful",
            data: {
                companyName: response.data.localizedName,
                industry: response.data.industry
            }
        };

    } catch (error) {
        return {
            success: false,
            message: "Connection failed",
            error: error.response?.data?.message || error.message
        };
    }
};

// Test TikTok connection
const testTikTokConnection = async (account) => {
    try {
        const accessToken = account.tiktokAccessToken || account.accessToken;
        const openId = account.tiktokOpenId;

        if (!accessToken || !openId) {
            return {
                success: false,
                message: "Missing TikTok credentials",
                error: "Access token and Open ID are required"
            };
        }

        const response = await axios.get(
            'https://open.tiktokapis.com/v2/user/info/',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            message: "Connection successful",
            data: {
                username: response.data.data.user.display_name,
                followers: response.data.data.stats.follower_count,
                following: response.data.data.stats.following_count,
                likes: response.data.data.stats.like_count
            }
        };

    } catch (error) {
        return {
            success: false,
            message: "Connection failed",
            error: error.response?.data?.error?.message || error.message
        };
    }
};

// Test Reddit connection
const testRedditConnection = async (account) => {
    try {
        const accessToken = account.accessToken;
        const username = account.redditUsername;

        if (!accessToken || !username) {
            return {
                success: false,
                message: "Missing Reddit credentials",
                error: "Access token and username are required"
            };
        }

        const response = await axios.get(
            `https://oauth.reddit.com/user/${username}/about`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'Reach-Way/1.0'
                }
            }
        );

        return {
            success: true,
            message: "Connection successful",
            data: {
                username: response.data.data.name,
                karma: response.data.data.total_karma,
                created: response.data.data.created_utc,
                subreddits: account.redditSubreddits || []
            }
        };

    } catch (error) {
        return {
            success: false,
            message: "Connection failed",
            error: error.response?.data?.message || error.message
        };
    }
};

module.exports = {
    postToMultiplePlatforms,
    getUserSocialAccounts,
    addSocialAccount,
    updateSocialAccount,
    deleteSocialAccount,
    testAccountConnection
};
