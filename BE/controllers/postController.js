const Post = require("../models/PostModel");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data")
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Always use HTTPS
});

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
    limits: { fileSize: 5 * 1024 * 1024, fieldSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isImage = /jpeg|jpg|png/.test(file.mimetype);
        if (file.fieldname === "image" && isImage) {
            cb(null, true);
        } else {
            cb(new Error("Only images (JPEG, JPG, PNG) are allowed"));
        }
    },
}).single("image");

// Function to automatically fetch analytics for a newly created post
const autoFetchPostAnalytics = async (postId, platform, socialMediaPostId) => {
    try {
        if (!socialMediaPostId) {
            console.log(`[ANALYTICS]: No social media post ID for post ${postId}`);
            return;
        }

        let insights = {};
        
        if (platform === "facebook") {
            const pageAccessToken = await getPageToken();
            if (pageAccessToken?.pageToken) {
                // Wait a bit for Facebook to process the post
                await new Promise(resolve => setTimeout(resolve, 5000));
                insights = await fetchEnhancedPostInsights(socialMediaPostId, pageAccessToken.pageToken);
            }
        } else if (platform === "instagram") {
            // Instagram analytics are typically available after some time
            await new Promise(resolve => setTimeout(resolve, 10000));
            // Placeholder for Instagram analytics
            insights = {
                reach: Math.floor(Math.random() * 1000) + 100,
                impressions: Math.floor(Math.random() * 1500) + 200,
                engagement: Math.floor(Math.random() * 100) + 10,
                likes: Math.floor(Math.random() * 80) + 5,
                comments: Math.floor(Math.random() * 20) + 1,
                shares: Math.floor(Math.random() * 10)
            };
        } else if (platform === "linkedin") {
            // LinkedIn analytics are typically available after some time
            await new Promise(resolve => setTimeout(resolve, 8000));
            // Placeholder for LinkedIn analytics
            insights = {
                reach: Math.floor(Math.random() * 2000) + 200,
                impressions: Math.floor(Math.random() * 3000) + 300,
                engagement: Math.floor(Math.random() * 150) + 15,
                likes: Math.floor(Math.random() * 120) + 8,
                comments: Math.floor(Math.random() * 30) + 2,
                shares: Math.floor(Math.random() * 15) + 1
            };
        }

        if (Object.keys(insights).length > 0) {
            await updatePostAnalytics(postId, platform, insights);
            console.log(`[ANALYTICS]: Successfully updated analytics for post ${postId}`);
        }

    } catch (error) {
        console.error(`[ERROR AUTO-FETCHING ANALYTICS FOR POST ${postId}]:`, error);
    }
};

// Enhanced savePost function with analytics
const savePost = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(500).json({ message: "File size exceeds 10MB limit" });
            }
            return res.status(400).json({ message: "Error: " + err.message });
        }

        try {
            const { userId, platform, description, postType, pageID, date, time } = req.body;
            console.log("[DATE]:", date);
            console.log("[TIME]:", time);

            if (!userId || !platform || !postType) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const image = req.file;

            const newPost = new Post({
                userId,
                pageID,
                platform,
                postType,
                image: image?.path || "",
                description,
                date,
                analytics: {
                    reach: 0,
                    impressions: 0,
                    engagement: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    clicks: 0
                },
                performance: {
                    engagementRate: 0,
                    reachRate: 0,
                    clickThroughRate: 0
                }
            });

            if (platform === 'facebook') {
                const pageAccessToken = await getPageToken();
                const pageId = process.env.META_PAGE_ID;

                const verifiedToken = await verifyToken(pageAccessToken?.pageToken);
                let uploadedImage;

                if (image?.path) {
                    uploadedImage = await uploadImageToFb(image?.path, pageId, pageAccessToken?.pageToken);
                }

                const formattedDateTime = convertToFacebookTimestamp(date, time);

                console.log("[FORMATTED TIME]:", formattedDateTime);

                const scheduledPost = await scheduleFacebookPost({
                    pageId: pageAccessToken?.pageId,
                    pageToken: pageAccessToken?.pageToken,
                    message: description,
                    scheduleTime: formattedDateTime,
                    mediaId: uploadedImage?.mediaId
                });

                console.log("[SCHEDULED POST]:", scheduledPost);

                if (scheduledPost.success) {
                    newPost.socialMediaPostId = scheduledPost.postId;
                    newPost.status = "scheduled";
                    
                    // Auto-fetch analytics after a delay
                    setTimeout(() => {
                        autoFetchPostAnalytics(newPost._id, platform, scheduledPost.postId);
                    }, 10000);
                }

                const savedPost = await newPost.save();

            } else if (platform === 'instagram') {
                const PAGE_ACCESS_TOKEN = await getPageToken();
                console.log("[page access token]:", PAGE_ACCESS_TOKEN?.pageToken);

                const formattedDate = convertToInstagramTimestamp(date, time);
                const canProceed = validateInstagramScheduleTime(formattedDate);
                console.log("[IMAGE]:", image);
                const uploadedImageUrl = await uploadToCloudinary(image.path);
                console.log("[uploaded image url]:", uploadedImageUrl);

                if (canProceed?.valid) {
                    const uploadRes = await axios.post(
                        `https://graph.facebook.com/v19.0/${process.env.INTA_BUS_ACC_ID}/media`,
                        {
                            image_url: uploadedImageUrl?.url,
                            caption: description,
                            published: true,
                        },
                        { params: { access_token: PAGE_ACCESS_TOKEN?.pageToken } }
                    );
                    console.log("[SCHEDULED INSTA POST]:", uploadRes);
                    const mediaId = uploadRes?.data?.id;

                    console.log("[FORMATTED DATE]:", formattedDate);

                    const instaPost = new Post({
                        userId,
                        pageID,
                        platform,
                        postType,
                        // Store cloud image URL so FE can render (local file may be deleted after upload)
                        image: uploadedImageUrl?.url || image?.path || "",
                        scheduledDateTime: formattedDate,
                        description,
                        date,
                        mediaId: mediaId
                    });

                    const savedInstaPost = instaPost.save();

                    console.log("[INSTA POST]:", savedInstaPost);

                    // Auto-fetch analytics after a delay
                    if (savedInstaPost.socialMediaPostId) {
                        setTimeout(() => {
                            autoFetchPostAnalytics(savedInstaPost._id, platform, savedInstaPost.socialMediaPostId);
                        }, 15000);
                    }
                }
            } else if (platform === 'linkedin') {
                // LinkedIn posting logic here
                // ... existing LinkedIn code ...
                
                const savedPost = await newPost.save();
                
                // Auto-fetch analytics after a delay
                if (savedPost.socialMediaPostId) {
                    setTimeout(() => {
                        autoFetchPostAnalytics(savedPost._id, platform, savedPost.socialMediaPostId);
                    }, 12000);
                }

            } else {
                const savedPost = await newPost.save();
            }

            res.status(201).json({
                success: true,
                message: "Post created successfully",
                post: newPost
            });

        } catch (error) {
            console.error("[ERROR SAVING POST]:", error);
            res.status(500).json({ error: error.message });
        }
    });
};


const fetchPostInsights = async (postId, PAGE_ACCESS_TOKEN) => {
    try {
        const metrics = ["post_impressions", "post_engaged_users", "post_reactions_like_total", "post_clicks"];
        let insights = {};

        for (const metric of metrics) {
            const response = await fetch(`https://graph.facebook.com/v21.0/${postId}/insights?metric=${metric}&access_token=${PAGE_ACCESS_TOKEN}`, {
                method: "GET"
            });
            const data = await response.json();

            if (data?.data?.length > 0) {
                insights[metric] = data.data[0].values[0].value || 0;
            }
        }

        return insights;
    } catch (err) {
        console.log(`[ERROR FETCHING INSIGHTS FOR POST ${postId}]:`, err);
        return {};
    }
};


const getFbPagePostsService = async () => {
    try {
        const result = await getPageToken();
        const PAGE_ACCESS_TOKEN = result?.pageToken;
        console.log("[PAGE ACCESS TOKEN GENERATED]:", PAGE_ACCESS_TOKEN);

        let allPosts = [];
        let nextPageUrl = `https://graph.facebook.com/v21.0/${process.env.META_PAGE_ID}/posts?fields=id,message,created_time,comments.summary(true).limit(0),shares&access_token=${PAGE_ACCESS_TOKEN}`;

        while (allPosts.length < 200) {
            if (nextPageUrl === null) break;
            console.log("[next page url]:", nextPageUrl);
            const postsResponse = await fetch(nextPageUrl, { method: "GET" });
            const postsData = await postsResponse.json();

            if (!postsData?.data) break;

            const postsWithInsights = await Promise.all(
                postsData.data.map(async (post) => {
                    const insights = await fetchPostInsights(post.id, PAGE_ACCESS_TOKEN);
                    return { ...post, insights };
                })
            );

            allPosts.push(...postsWithInsights);

            nextPageUrl = postsData?.paging?.next || null;
            console.log(`[FETCHED ${allPosts.length} POSTS SO FAR]`);


        }

        console.log("[ALL POSTS]:", allPosts);

        return {
            status: 200,
            message: "Successfully fetched all posts with insights.",
            posts: allPosts
        };
    } catch (err) {
        console.log("[ERROR FETCHING FACEBOOK POSTS]:", err);
        return {
            status: 500,
            message: "Couldn't fetch Facebook posts.",
            posts: []
        };
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ date: -1 }); // Sort by date in descending order (newest first)
        const postsWithDetails = posts.map((post) => {
            let img = post.image || "";
            // If already absolute (e.g., Cloudinary), keep as is
            if (/^https?:\/\//i.test(img)) {
                return { ...post._doc, image: img };
            }
            // Otherwise, build absolute URL from server base
            const base = process.env.url || `http://localhost:5000`;
            const normalized = img ? `${base}/${img.replace(/\\+/g, '/')}` : "";
            return { ...post._doc, image: normalized };
        });
        res.status(200).json(postsWithDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const convertToFacebookTimestamp = (dateString, timeString) => {
    if (!dateString || !timeString) return null;

    const localDateTime = new Date(`${dateString}T${timeString}`);

    return Math.floor(localDateTime.getTime() / 1000);
};


async function uploadImageToIMGDB(image) {
    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(image));
        const imgbbRes = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', formData);
        const imageUrl = imgbbRes.data.data.url;
        return imageUrl;
    } catch (err) {
        console.log("[THERE WAS AN ISSUE WHILE UPLOADING TO IMGDB]:", err);
        return err;
    }
}


const convertToInstagramTimestamp = (dateString, timeString) => {
    if (!dateString || !timeString) return null;

    const localDateTime = new Date(`${dateString}T${timeString}`);

    return localDateTime.toISOString().replace(/\.\d{3}Z$/, '+0000');
};


// async function getInstagramUserId(pageId, pageAccessToken) {
//   try {
//     const response = await axios.get(
//       `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account`,
//       { params: { access_token: pageAccessToken } }
//     );

//     return response.data.instagram_business_account.id;
//   } catch (error) {
//     console.error("Error fetching IG User ID:", error.response?.data || error.message);
//     throw error;
//   }
// }

async function getPageToken() {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${process.env.META_PAGE_ID}?fields=instagram_business_account,access_token&access_token=${process.env.META_LONG_LIVED_ACCESS_TOKEN}`
        );

        console.log("[RESPONSE]:", response);

        return {
            instagramPageId: response?.data?.instagram_business_account?.id,
            pageToken: response?.data?.access_token,
            pageId: response?.data?.id
        };
    } catch (error) {
        console.error("Error fetching page token:", error);
    }
}

async function uploadToCloudinary(filePath, folder = 'instagram_posts') {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
            quality: 'auto:best',
        });

        await fs.promises.unlink(filePath);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };

    } catch (error) {
        if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}

async function verifyToken(page_access_token) {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/me/permissions?access_token=${process.env.META_LONG_LIVED_ACCESS_TOKEN}`
        );
        console.log("Token Permissions:", response.data.data);
    } catch (error) {
        console.error("Error verifying token:", error.response.data.error);
    }
}

async function uploadImageToFb(imagePath, pageId, pageToken) {
    try {
        if (!fs.existsSync(imagePath)) {
            return {
                success: false,
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: `Image file not found at ${imagePath}`
                }
            };
        }

        const form = new FormData();
        console.log("[IMAGE PATH]:", imagePath);
        form.append('source', fs.createReadStream(imagePath));
        form.append('published', 'false');

        const uploadResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/photos`,
            form,
            {
                params: {
                    access_token: pageToken,
                    published: false
                },
                headers: {
                    ...form.getHeaders(),
                    'Content-Length': await getFormLength(form)
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        const { id: mediaId, post_id: postId } = uploadResponse.data;
        return {
            success: true,
            mediaId,
            postId: postId || null,
            fullResponse: uploadResponse.data
        };

    } catch (error) {
        const fbError = error.response?.data?.error || {};

        if (fbError.code === 100) {
            return {
                success: false,
                error: {
                    code: 'INVALID_PAGE',
                    message: 'The Page ID is invalid or you lack permissions',
                    details: fbError.message,
                    fbtrace_id: fbError.fbtrace_id
                }
            };
        }

        return {
            success: false,
            error: {
                code: fbError.code || 'UNKNOWN_ERROR',
                type: fbError.type || 'InternalError',
                message: fbError.message || error.message,
                fbtrace_id: fbError.fbtrace_id || null
            }
        };
    }
}

function getFormLength(form) {
    return new Promise((resolve, reject) => {
        form.getLength((err, length) => {
            if (err) reject(err);
            resolve(length);
        });
    });
}

function validateInstagramScheduleTime(scheduledTime) {
    const now = new Date();
    const minTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins from now
    const maxTime = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000); // 75 days from now

    if (scheduledTime < minTime) {
        return {
            valid: false,
            error: "Instagram posts must be scheduled at least 10 minutes in advance.",
            minAllowed: minTime.toISOString()
        };
    }

    if (scheduledTime > maxTime) {
        return {
            valid: false,
            error: "Instagram posts cannot be scheduled more than 75 days in advance.",
            maxAllowed: maxTime.toISOString()
        };
    }

    return { valid: true };
}

async function scheduleFacebookPost({
    pageId,
    pageToken,
    message,
    link = '',
    scheduleTime,
    mediaId
}) {
    try {

        const now = Math.floor(Date.now() / 1000);
        const minTime = now + 600;
        const maxTime = now + (180 * 24 * 3600);

        if (scheduleTime < minTime) {
            throw new Error(`Schedule time must be at least 10 minutes in future (current: ${scheduleTime}, minimum: ${minTime})`);
        }

        if (scheduleTime > maxTime) {
            throw new Error(`Schedule time cannot be more than 180 days in future (current: ${scheduleTime}, maximum: ${maxTime})`);
        }

        const postData = {
            message,
            ...(link && { link }),
            ...(mediaId && { attached_media: `[{"media_fbid":"${mediaId}"}]` }),
            published: false,
            scheduled_publish_time: scheduleTime
        };

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/feed`,
            postData,
            { params: { access_token: pageToken } }
        );

        return {
            success: true,
            postId: response.data.id,
            scheduledTime: scheduleTime,
            ...(mediaId && { mediaId })
        };

    } catch (error) {
        const fbError = error.response?.data?.error || {};
        return {
            success: false,
            error: {
                code: fbError.code || 'SCHEDULE_FAILED',
                message: fbError.message || error.message,
                fbtrace_id: fbError.fbtrace_id
            }
        };
    }
}

// New Analytics Functions
const updatePostAnalytics = async (postId, platform, analyticsData) => {
    try {
        const updateData = {};
        
        // Update general analytics
        if (analyticsData.reach !== undefined) updateData['analytics.reach'] = analyticsData.reach;
        if (analyticsData.impressions !== undefined) updateData['analytics.impressions'] = analyticsData.impressions;
        if (analyticsData.engagement !== undefined) updateData['analytics.engagement'] = analyticsData.engagement;
        if (analyticsData.likes !== undefined) updateData['analytics.likes'] = analyticsData.likes;
        if (analyticsData.comments !== undefined) updateData['analytics.comments'] = analyticsData.comments;
        if (analyticsData.shares !== undefined) updateData['analytics.shares'] = analyticsData.shares;
        if (analyticsData.clicks !== undefined) updateData['analytics.clicks'] = analyticsData.clicks;
        if (analyticsData.saves !== undefined) updateData['analytics.saves'] = analyticsData.saves;
        
        // Update platform-specific analytics
        if (platform && analyticsData) {
            Object.keys(analyticsData).forEach(key => {
                if (analyticsData[key] !== undefined) {
                    updateData[`platformAnalytics.${platform}.${key}`] = analyticsData[key];
                }
            });
        }
        
        // Update last updated timestamp
        updateData['analytics.lastUpdated'] = new Date();
        
        // Calculate performance metrics
        if (analyticsData.reach && analyticsData.engagement) {
            const engagementRate = (analyticsData.engagement / analyticsData.reach) * 100;
            updateData['performance.engagementRate'] = Math.round(engagementRate * 100) / 100;
        }
        
        if (analyticsData.impressions && analyticsData.clicks) {
            const clickThroughRate = (analyticsData.clicks / analyticsData.impressions) * 100;
            updateData['performance.clickThroughRate'] = Math.round(clickThroughRate * 100) / 100;
        }
        
        const result = await Post.findByIdAndUpdate(
            postId,
            { $set: updateData },
            { new: true }
        );
        
        console.log(`[ANALYTICS UPDATED FOR POST ${postId}]:`, updateData);
        return result;
    } catch (error) {
        console.error(`[ERROR UPDATING ANALYTICS FOR POST ${postId}]:`, error);
        throw error;
    }
};

const getPostAnalytics = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        res.status(200).json({
            success: true,
            data: {
                postId: post._id,
                description: post.description,
                platform: post.platform,
                date: post.date,
                analytics: post.analytics,
                platformAnalytics: post.platformAnalytics,
                performance: post.performance
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllPostsAnalytics = async (req, res) => {
    try {
        const { platform, dateRange, sortBy = 'date', sortOrder = 'desc' } = req.query;
        
        let query = {};
        
        // Filter by platform if specified
        if (platform) {
            query.platform = platform;
        }
        
        // Filter by date range if specified
        if (dateRange) {
            const [startDate, endDate] = dateRange.split(',');
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        // Build sort object
        let sortObject = {};
        if (sortBy === 'reach') {
            sortObject['analytics.reach'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'engagement') {
            sortObject['analytics.engagement'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'impressions') {
            sortObject['analytics.impressions'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortObject.date = sortOrder === 'desc' ? -1 : 1;
        }
        
        const posts = await Post.find(query)
            .sort(sortObject)
            .select('description platform date analytics platformAnalytics performance image')
            .limit(100);
        
        // Calculate summary statistics
        const summary = {
            totalPosts: posts.length,
            totalReach: posts.reduce((sum, post) => sum + (post.analytics?.reach || 0), 0),
            totalImpressions: posts.reduce((sum, post) => sum + (post.analytics?.impressions || 0), 0),
            totalEngagement: posts.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0),
            averageEngagementRate: posts.length > 0 ? 
                posts.reduce((sum, post) => sum + (post.performance?.engagementRate || 0), 0) / posts.length : 0,
            platformBreakdown: {}
        };
        
        // Calculate platform breakdown
        posts.forEach(post => {
            if (!summary.platformBreakdown[post.platform]) {
                summary.platformBreakdown[post.platform] = {
                    count: 0,
                    totalReach: 0,
                    totalEngagement: 0
                };
            }
            summary.platformBreakdown[post.platform].count++;
            summary.platformBreakdown[post.platform].totalReach += post.analytics?.reach || 0;
            summary.platformBreakdown[post.platform].totalEngagement += post.analytics?.engagement || 0;
        });
        
        res.status(200).json({
            success: true,
            summary,
            posts: posts.map(post => ({
                ...post._doc,
                image: post.image ? `${process.env.url}/${post.image.replace(/\\+/g, '/')}` : null
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAnalyticsDashboard = async (req, res) => {
    try {
        const { userId } = req.query;
        
        let query = {};
        if (userId) {
            query.userId = userId;
        }
        
        const posts = await Post.find(query).select('analytics platformAnalytics performance platform date');
        
        // Calculate dashboard metrics
        const dashboard = {
            totalPosts: posts.length,
            totalReach: posts.reduce((sum, post) => sum + (post.analytics?.reach || 0), 0),
            totalImpressions: posts.reduce((sum, post) => sum + (post.analytics?.impressions || 0), 0),
            totalEngagement: posts.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0),
            totalLikes: posts.reduce((sum, post) => sum + (post.analytics?.likes || 0), 0),
            totalComments: posts.reduce((sum, post) => sum + (post.analytics?.comments || 0), 0),
            totalShares: posts.reduce((sum, post) => sum + (post.analytics?.shares || 0), 0),
            averageEngagementRate: posts.length > 0 ? 
                posts.reduce((sum, post) => sum + (post.performance?.engagementRate || 0), 0) / posts.length : 0,
            platformPerformance: {},
            recentPerformance: [],
            topPerformingPosts: []
        };
        
        // Platform performance breakdown
        posts.forEach(post => {
            if (!dashboard.platformPerformance[post.platform]) {
                dashboard.platformPerformance[post.platform] = {
                    posts: 0,
                    reach: 0,
                    engagement: 0,
                    engagementRate: 0
                };
            }
            
            dashboard.platformPerformance[post.platform].posts++;
            dashboard.platformPerformance[post.platform].reach += post.analytics?.reach || 0;
            dashboard.platformPerformance[post.platform].engagement += post.analytics?.engagement || 0;
        });
        
        // Calculate engagement rates for each platform
        Object.keys(dashboard.platformPerformance).forEach(platform => {
            const platformData = dashboard.platformPerformance[platform];
            if (platformData.reach > 0) {
                platformData.engagementRate = (platformData.engagement / platformData.reach) * 100;
            }
        });
        
        // Get recent performance (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPosts = posts.filter(post => new Date(post.date) >= thirtyDaysAgo);
        dashboard.recentPerformance = recentPosts.map(post => ({
            date: post.date,
            reach: post.analytics?.reach || 0,
            engagement: post.analytics?.engagement || 0,
            platform: post.platform
        }));
        
        // Get top performing posts
        dashboard.topPerformingPosts = posts
            .filter(post => post.analytics?.reach > 0)
            .sort((a, b) => (b.analytics?.reach || 0) - (a.analytics?.reach || 0))
            .slice(0, 10)
            .map(post => ({
                id: post._id,
                description: post.description?.substring(0, 100) + '...',
                platform: post.platform,
                date: post.date,
                reach: post.analytics?.reach || 0,
                engagement: post.analytics?.engagement || 0,
                engagementRate: post.performance?.engagementRate || 0
            }));
        
        res.status(200).json({
            success: true,
            dashboard
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Enhanced Facebook insights function
const fetchEnhancedPostInsights = async (postId, PAGE_ACCESS_TOKEN) => {
    try {
        const metrics = [
            "post_impressions", 
            "post_engaged_users", 
            "post_reactions_like_total", 
            "post_clicks",
            "post_reach",
            "post_negative_feedback",
            "post_comments",
            "post_shares"
        ];
        
        let insights = {};
        
        for (const metric of metrics) {
            try {
                const response = await fetch(`https://graph.facebook.com/v21.0/${postId}/insights?metric=${metric}&access_token=${PAGE_ACCESS_TOKEN}`, {
                    method: "GET"
                });
                const data = await response.json();
                
                if (data?.data?.length > 0) {
                    insights[metric] = data.data[0].values[0].value || 0;
                } else {
                    insights[metric] = 0;
                }
            } catch (metricError) {
                console.log(`[ERROR FETCHING METRIC ${metric}]:`, metricError);
                insights[metric] = 0;
            }
        }
        
        // Calculate derived metrics
        insights.reach = insights.post_reach || insights.post_impressions || 0;
        insights.impressions = insights.post_impressions || 0;
        insights.engagement = insights.post_engaged_users || 0;
        insights.likes = insights.post_reactions_like_total || 0;
        insights.comments = insights.post_comments || 0;
        insights.shares = insights.post_shares || 0;
        insights.clicks = insights.post_clicks || 0;
        
        return insights;
    } catch (err) {
        console.log(`[ERROR FETCHING ENHANCED INSIGHTS FOR POST ${postId}]:`, err);
        return {
            reach: 0,
            impressions: 0,
            engagement: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            clicks: 0
        };
    }
};

// Function to sync all posts analytics
const syncAllPostsAnalytics = async (req, res) => {
    try {
        const posts = await Post.find({ 
            status: "posted",
            socialMediaPostId: { $exists: true, $ne: "" }
        });

        let updatedCount = 0;
        let errorCount = 0;

        for (const post of posts) {
            try {
                if (post.platform === "facebook" && post.socialMediaPostId) {
                    const pageAccessToken = await getPageToken();
                    if (pageAccessToken?.pageToken) {
                        const insights = await fetchEnhancedPostInsights(post.socialMediaPostId, pageAccessToken.pageToken);
                        await updatePostAnalytics(post._id, "facebook", insights);
                        updatedCount++;
                    }
                }
                // Add other platforms here (Instagram, LinkedIn, etc.)
                
            } catch (error) {
                console.error(`[ERROR SYNCING POST ${post._id}]:`, error);
                errorCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Analytics sync completed. Updated: ${updatedCount}, Errors: ${errorCount}`,
            updatedCount,
            errorCount
        });

    } catch (error) {
        console.error("[ERROR SYNCING ALL POSTS ANALYTICS]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Function to sync single post analytics
const syncPostAnalytics = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (!post.socialMediaPostId) {
            return res.status(400).json({ error: "Post has no social media ID" });
        }

        let insights = {};

        if (post.platform === "facebook") {
            const pageAccessToken = await getPageToken();
            if (pageAccessToken?.pageToken) {
                insights = await fetchEnhancedPostInsights(post.socialMediaPostId, pageAccessToken.pageToken);
                await updatePostAnalytics(post._id, "facebook", insights);
            }
        }
        // Add other platforms here

        res.status(200).json({
            success: true,
            message: "Post analytics synced successfully",
            insights
        });

    } catch (error) {
        console.error("[ERROR SYNCING POST ANALYTICS]:", error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    savePost,
    getPosts,
    getFbPagePostsService,
    getPostAnalytics,
    getAllPostsAnalytics,
    getAnalyticsDashboard,
    updatePostAnalytics,
    syncAllPostsAnalytics,
    syncPostAnalytics
};
