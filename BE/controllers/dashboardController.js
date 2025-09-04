const SocialAccount = require("../models/SocialAccountModel");
const Post = require("../models/PostModel");
const axios = require("axios");

// Get comprehensive dashboard data from all platforms
const getMultiPlatformDashboard = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Get user's active social accounts
        const accounts = await SocialAccount.find({ 
            userId: userId, 
            isActive: true 
        });

        if (accounts.length === 0) {
            return res.status(200).json({
                success: true,
                dashboard: {
                    totalAccounts: 0,
                    totalPosts: 0,
                    totalReach: 0,
                    totalEngagement: 0,
                    averageEngagementRate: 0,
                    platformBreakdown: {},
                    recentPosts: [],
                    topPerformingPosts: [],
                    accountStatus: [],
                    insights: {}
                }
            });
        }

        // Get posts from all platforms
        const posts = await Post.find({ userId }).sort({ date: -1 });

        // Initialize dashboard data
        const dashboard = {
            totalAccounts: accounts.length,
            totalPosts: posts.length,
            totalReach: 0,
            totalImpressions: 0,
            totalEngagement: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            averageEngagementRate: 0,
            platformBreakdown: {},
            recentPosts: [],
            topPerformingPosts: [],
            accountStatus: [],
            insights: {},
            performanceTrends: []
        };

        // Process platform breakdown
        accounts.forEach(account => {
            if (!dashboard.platformBreakdown[account.platform]) {
                dashboard.platformBreakdown[account.platform] = {
                    accounts: 0,
                    posts: 0,
                    reach: 0,
                    impressions: 0,
                    engagement: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    engagementRate: 0
                };
            }
            dashboard.platformBreakdown[account.platform].accounts++;
        });

        // Process posts data
        posts.forEach(post => {
            if (dashboard.platformBreakdown[post.platform]) {
                dashboard.platformBreakdown[post.platform].posts++;
                dashboard.platformBreakdown[post.platform].reach += post.analytics?.reach || 0;
                dashboard.platformBreakdown[post.platform].impressions += post.analytics?.impressions || 0;
                dashboard.platformBreakdown[post.platform].engagement += post.analytics?.engagement || 0;
                dashboard.platformBreakdown[post.platform].likes += post.analytics?.likes || 0;
                dashboard.platformBreakdown[post.platform].comments += post.analytics?.comments || 0;
                dashboard.platformBreakdown[post.platform].shares += post.analytics?.shares || 0;
            }

            // Aggregate totals
            dashboard.totalReach += post.analytics?.reach || 0;
            dashboard.totalImpressions += post.analytics?.impressions || 0;
            dashboard.totalEngagement += post.analytics?.engagement || 0;
            dashboard.totalLikes += post.analytics?.likes || 0;
            dashboard.totalComments += post.analytics?.comments || 0;
            dashboard.totalShares += post.analytics?.shares || 0;
        });

        // Calculate engagement rates for each platform
        Object.keys(dashboard.platformBreakdown).forEach(platform => {
            const platformData = dashboard.platformBreakdown[platform];
            if (platformData.reach > 0) {
                platformData.engagementRate = (platformData.engagement / platformData.reach) * 100;
            }
        });

        // Calculate overall engagement rate
        if (dashboard.totalReach > 0) {
            dashboard.averageEngagementRate = (dashboard.totalEngagement / dashboard.totalReach) * 100;
        }

        // Get recent posts (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPosts = posts.filter(post => new Date(post.date) >= thirtyDaysAgo);
        dashboard.recentPosts = recentPosts.slice(0, 10).map(post => ({
            id: post._id,
            description: post.description?.substring(0, 100) + '...',
            platform: post.platform,
            date: post.date,
            reach: post.analytics?.reach || 0,
            engagement: post.analytics?.engagement || 0,
            engagementRate: post.performance?.engagementRate || 0,
            image: post.image
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
                engagementRate: post.performance?.engagementRate || 0,
                image: post.image
            }));

        // Account status and health
        dashboard.accountStatus = accounts.map(account => ({
            id: account._id,
            platform: account.platform,
            accountName: account.accountName,
            accountType: account.accountType,
            isActive: account.isActive,
            isVerified: account.isVerified,
            followers: account.followers,
            lastSync: account.lastSync,
            profilePicture: account.profilePicture
        }));

        // Performance trends (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dailyData = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyData[dateStr] = { reach: 0, engagement: 0, posts: 0 };
        }

        posts.forEach(post => {
            const postDate = new Date(post.date).toISOString().split('T')[0];
            if (dailyData[postDate]) {
                dailyData[postDate].reach += post.analytics?.reach || 0;
                dailyData[postDate].engagement += post.analytics?.engagement || 0;
                dailyData[postDate].posts += 1;
            }
        });

        dashboard.performanceTrends = Object.keys(dailyData).map(date => ({
            date: date,
            reach: dailyData[date].reach,
            engagement: dailyData[date].engagement,
            posts: dailyData[date].posts
        }));

        // Platform-specific insights
        dashboard.insights = {
            bestPerformingPlatform: Object.keys(dashboard.platformBreakdown)
                .reduce((best, platform) => {
                    const current = dashboard.platformBreakdown[platform];
                    const bestData = dashboard.platformBreakdown[best];
                    return (current.engagementRate > bestData.engagementRate) ? platform : best;
                }),
            mostActivePlatform: Object.keys(dashboard.platformBreakdown)
                .reduce((most, platform) => {
                    const current = dashboard.platformBreakdown[platform];
                    const mostData = dashboard.platformBreakdown[most];
                    return (current.posts > mostData.posts) ? platform : most;
                }),
            totalFollowers: accounts.reduce((sum, account) => sum + (account.followers || 0), 0),
            averagePostsPerDay: posts.length / 30, // Last 30 days
            engagementGrowth: calculateEngagementGrowth(posts)
        };

        res.status(200).json({
            success: true,
            dashboard
        });

    } catch (error) {
        console.error("[ERROR FETCHING MULTI-PLATFORM DASHBOARD]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get platform-specific insights
const getPlatformInsights = async (req, res) => {
    try {
        const { userId, platform } = req.query;

        if (!userId || !platform) {
            return res.status(400).json({ error: "User ID and platform are required" });
        }

        // Get platform-specific accounts
        const accounts = await SocialAccount.find({ 
            userId: userId, 
            platform: platform,
            isActive: true 
        });

        if (accounts.length === 0) {
            return res.status(200).json({
                success: true,
                insights: {
                    platform: platform,
                    accounts: [],
                    posts: [],
                    totalReach: 0,
                    totalEngagement: 0,
                    engagementRate: 0
                }
            });
        }

        // Get platform-specific posts
        const posts = await Post.find({ 
            userId: userId, 
            platform: platform 
        }).sort({ date: -1 });

        const insights = {
            platform: platform,
            accounts: accounts.map(account => ({
                id: account._id,
                accountName: account.accountName,
                accountType: account.accountType,
                followers: account.followers,
                isVerified: account.isVerified
            })),
            posts: posts.map(post => ({
                id: post._id,
                description: post.description?.substring(0, 100) + '...',
                date: post.date,
                reach: post.analytics?.reach || 0,
                engagement: post.analytics?.engagement || 0,
                engagementRate: post.performance?.engagementRate || 0,
                likes: post.analytics?.likes || 0,
                comments: post.analytics?.comments || 0,
                shares: post.analytics?.shares || 0
            })),
            totalReach: posts.reduce((sum, post) => sum + (post.analytics?.reach || 0), 0),
            totalEngagement: posts.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0),
            totalLikes: posts.reduce((sum, post) => sum + (post.analytics?.likes || 0), 0),
            totalComments: posts.reduce((sum, post) => sum + (post.analytics?.comments || 0), 0),
            totalShares: posts.reduce((sum, post) => sum + (post.analytics?.shares || 0), 0),
            engagementRate: 0
        };

        if (insights.totalReach > 0) {
            insights.engagementRate = (insights.totalEngagement / insights.totalReach) * 100;
        }

        res.status(200).json({
            success: true,
            insights
        });

    } catch (error) {
        console.error("[ERROR FETCHING PLATFORM INSIGHTS]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get account-specific insights
const getAccountInsights = async (req, res) => {
    try {
        const { accountId } = req.params;

        if (!accountId) {
            return res.status(400).json({ error: "Account ID is required" });
        }

        // Get account details
        const account = await SocialAccount.findById(accountId);
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        // Get account posts
        const posts = await Post.find({ 
            accountId: accountId 
        }).sort({ date: -1 });

        const insights = {
            account: {
                id: account._id,
                platform: account.platform,
                accountName: account.accountName,
                accountType: account.accountType,
                followers: account.followers,
                isVerified: account.isVerified,
                profilePicture: account.profilePicture
            },
            posts: posts.map(post => ({
                id: post._id,
                description: post.description?.substring(0, 100) + '...',
                date: post.date,
                reach: post.analytics?.reach || 0,
                engagement: post.analytics?.engagement || 0,
                engagementRate: post.performance?.engagementRate || 0,
                likes: post.analytics?.likes || 0,
                comments: post.analytics?.comments || 0,
                shares: post.analytics?.shares || 0
            })),
            totalPosts: posts.length,
            totalReach: posts.reduce((sum, post) => sum + (post.analytics?.reach || 0), 0),
            totalEngagement: posts.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0),
            averageEngagementRate: 0,
            bestPerformingPost: null,
            recentPerformance: []
        };

        if (insights.totalReach > 0) {
            insights.averageEngagementRate = (insights.totalEngagement / insights.totalReach) * 100;
        }

        // Find best performing post
        if (posts.length > 0) {
            insights.bestPerformingPost = posts
                .filter(post => post.analytics?.reach > 0)
                .sort((a, b) => (b.analytics?.reach || 0) - (a.analytics?.reach || 0))[0];
        }

        // Recent performance (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentPosts = posts.filter(post => new Date(post.date) >= sevenDaysAgo);
        insights.recentPerformance = recentPosts.map(post => ({
            date: post.date,
            reach: post.analytics?.reach || 0,
            engagement: post.analytics?.engagement || 0
        }));

        res.status(200).json({
            success: true,
            insights
        });

    } catch (error) {
        console.error("[ERROR FETCHING ACCOUNT INSIGHTS]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function to calculate engagement growth
const calculateEngagementGrowth = (posts) => {
    if (posts.length < 2) return 0;

    const sortedPosts = posts.sort((a, b) => new Date(a.date) - new Date(b.date));
    const midPoint = Math.floor(sortedPosts.length / 2);
    
    const firstHalf = sortedPosts.slice(0, midPoint);
    const secondHalf = sortedPosts.slice(midPoint);

    const firstHalfEngagement = firstHalf.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0);
    const secondHalfEngagement = secondHalf.reduce((sum, post) => sum + (post.analytics?.engagement || 0), 0);

    if (firstHalfEngagement === 0) return 0;

    return ((secondHalfEngagement - firstHalfEngagement) / firstHalfEngagement) * 100;
};

// Sync insights from social media platforms
const syncPlatformInsights = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Get user's active accounts
        const accounts = await SocialAccount.find({ 
            userId: userId, 
            isActive: true 
        });

        if (accounts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No active accounts found"
            });
        }

        let syncedCount = 0;
        let errorCount = 0;

        // Sync insights for each account
        for (const account of accounts) {
            try {
                await syncAccountInsights(account);
                syncedCount++;
            } catch (error) {
                console.error(`[ERROR SYNCING INSIGHTS FOR ACCOUNT ${account._id}]:`, error);
                errorCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Insights sync completed. Synced: ${syncedCount}, Errors: ${errorCount}`,
            syncedCount,
            errorCount
        });

    } catch (error) {
        console.error("[ERROR SYNCING PLATFORM INSIGHTS]:", error);
        res.status(500).json({ error: error.message });
    }
};

// Sync insights for a specific account
const syncAccountInsights = async (account) => {
    try {
        switch (account.platform) {
            case 'facebook':
                await syncFacebookInsights(account);
                break;
            case 'instagram':
                await syncInstagramInsights(account);
                break;
            case 'linkedin':
                await syncLinkedInInsights(account);
                break;
            default:
                console.log(`[UNSUPPORTED PLATFORM]: ${account.platform}`);
        }

        // Update last sync timestamp
        await SocialAccount.findByIdAndUpdate(account._id, {
            lastSync: new Date()
        });

    } catch (error) {
        throw error;
    }
};

// Sync Facebook insights
const syncFacebookInsights = async (account) => {
    try {
        const accessToken = account.pageAccessToken || account.accessToken;
        const pageId = account.pageId || account.accountId;

        if (!accessToken) return;

        // Get page insights
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${pageId}?fields=fan_count,verification_status&access_token=${accessToken}`
        );

        // Update account with new data
        await SocialAccount.findByIdAndUpdate(account._id, {
            followers: response.data.fan_count || 0,
            isVerified: response.data.verification_status === 'verified'
        });

    } catch (error) {
        console.error(`[ERROR SYNCING FACEBOOK INSIGHTS]:`, error);
    }
};

// Sync Instagram insights
const syncInstagramInsights = async (account) => {
    try {
        const accessToken = account.accessToken;
        const instagramId = account.instagramBusinessAccountId;

        if (!accessToken || !instagramId) return;

        // Get Instagram insights
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${instagramId}?fields=followers_count,media_count&access_token=${accessToken}`
        );

        // Update account with new data
        await SocialAccount.findByIdAndUpdate(account._id, {
            followers: response.data.followers_count || 0,
            posts: response.data.media_count || 0
        });

    } catch (error) {
        console.error(`[ERROR SYNCING INSTAGRAM INSIGHTS]:`, error);
    }
};

// Sync LinkedIn insights
const syncLinkedInInsights = async (account) => {
    try {
        const accessToken = account.accessToken;
        const companyId = account.linkedinCompanyId || account.accountId;

        if (!accessToken) return;

        // Get LinkedIn company insights
        const response = await axios.get(
            `https://api.linkedin.com/v2/organizations/${companyId}?projection=(localizedName,industry,specialties)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Update account metadata
        await SocialAccount.findByIdAndUpdate(account._id, {
            'metadata.industry': response.data.industry || '',
            'metadata.description': response.data.specialties?.join(', ') || ''
        });

    } catch (error) {
        console.error(`[ERROR SYNCING LINKEDIN INSIGHTS]:`, error);
    }
};

module.exports = {
    getMultiPlatformDashboard,
    getPlatformInsights,
    getAccountInsights,
    syncPlatformInsights
};
