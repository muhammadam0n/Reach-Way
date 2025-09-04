const axios = require('axios');
const SocialAccount = require('../models/SocialAccountModel');

// Reddit OAuth configuration
const REDDIT_CONFIG = {
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    redirectUri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:3001/auth/reddit/callback',
    userAgent: 'Reach-Way/1.0'
};

// Get Reddit OAuth URL
const getRedditAuthUrl = async (req, res) => {
    try {
        const state = Math.random().toString(36).substring(7);
        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${REDDIT_CONFIG.clientId}&response_type=code&state=${state}&redirect_uri=${REDDIT_CONFIG.redirectUri}&duration=permanent&scope=identity,submit,read,history`;
        
        res.status(200).json({
            success: true,
            authUrl,
            state
        });
    } catch (error) {
        console.error('[REDDIT AUTH URL ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Handle Reddit OAuth callback
const handleRedditCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;
        const { userId } = req.body;

        if (error) {
            return res.status(400).json({ error: 'Reddit authorization failed' });
        }

        if (!code || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Exchange code for access token
        const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
            `grant_type=authorization_code&code=${code}&redirect_uri=${REDDIT_CONFIG.redirectUri}`,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${REDDIT_CONFIG.clientId}:${REDDIT_CONFIG.clientSecret}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': REDDIT_CONFIG.userAgent
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://oauth.reddit.com/api/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'User-Agent': REDDIT_CONFIG.userAgent
            }
        });

        const userData = userResponse.data;

        // Get user's subreddits
        const subredditsResponse = await axios.get('https://oauth.reddit.com/subreddits/mine/subscriber', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'User-Agent': REDDIT_CONFIG.userAgent
            }
        });

        const subreddits = subredditsResponse.data.data.children.map(sub => ({
            name: sub.data.display_name,
            id: sub.data.id,
            permissions: ['submit', 'read']
        }));

        // Save or update Reddit account
        const existingAccount = await SocialAccount.findOne({
            userId,
            platform: 'reddit',
            accountId: userData.id
        });

        if (existingAccount) {
            // Update existing account
            existingAccount.accessToken = access_token;
            existingAccount.refreshToken = refresh_token;
            existingAccount.redditUsername = userData.name;
            existingAccount.redditSubreddits = subreddits;
            existingAccount.followers = userData.total_karma;
            existingAccount.lastSync = new Date();
            await existingAccount.save();
        } else {
            // Create new account
            const newAccount = new SocialAccount({
                userId,
                platform: 'reddit',
                accountType: 'personal',
                accountName: userData.name,
                accountId: userData.id,
                accessToken: access_token,
                refreshToken: refresh_token,
                redditUsername: userData.name,
                redditSubreddits: subreddits,
                followers: userData.total_karma,
                profilePicture: userData.icon_img || '',
                metadata: {
                    description: userData.subreddit?.public_description || '',
                    location: userData.subreddit?.location || ''
                }
            });
            await newAccount.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reddit account connected successfully',
            userData: {
                username: userData.name,
                karma: userData.total_karma,
                subreddits: subreddits.length
            }
        });

    } catch (error) {
        console.error('[REDDIT CALLBACK ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Reddit user info
const getRedditUserInfo = async (req, res) => {
    try {
        const { accountId } = req.params;
        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'reddit') {
            return res.status(404).json({ error: 'Reddit account not found' });
        }

        const response = await axios.get('https://oauth.reddit.com/api/v1/me', {
            headers: {
                'Authorization': `Bearer ${account.accessToken}`,
                'User-Agent': REDDIT_CONFIG.userAgent
            }
        });

        res.status(200).json({
            success: true,
            userInfo: response.data
        });

    } catch (error) {
        console.error('[REDDIT USER INFO ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user's subreddits
const getUserSubreddits = async (req, res) => {
    try {
        const { accountId } = req.params;
        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'reddit') {
            return res.status(404).json({ error: 'Reddit account not found' });
        }

        const response = await axios.get('https://oauth.reddit.com/subreddits/mine/subscriber', {
            headers: {
                'Authorization': `Bearer ${account.accessToken}`,
                'User-Agent': REDDIT_CONFIG.userAgent
            }
        });

        const subreddits = response.data.data.children.map(sub => ({
            name: sub.data.display_name,
            id: sub.data.id,
            title: sub.data.title,
            subscribers: sub.data.subscribers,
            description: sub.data.public_description,
            url: sub.data.url
        }));

        res.status(200).json({
            success: true,
            subreddits
        });

    } catch (error) {
        console.error('[REDDIT SUBREDDITS ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Post to Reddit
const postToReddit = async (req, res) => {
    try {
        const { accountId, subreddit, title, content, postType = 'text' } = req.body;
        const account = await SocialAccount.findById(accountId);

        if (!account || account.platform !== 'reddit') {
            return res.status(404).json({ error: 'Reddit account not found' });
        }

        let postData = {
            sr: subreddit,
            title: title.substring(0, 300), // Reddit title limit
            kind: postType
        };

        if (postType === 'text') {
            postData.text = content;
        } else if (postType === 'link') {
            postData.url = content;
        }

        const response = await axios.post(
            'https://oauth.reddit.com/api/submit',
            postData,
            {
                headers: {
                    'Authorization': `Bearer ${account.accessToken}`,
                    'User-Agent': REDDIT_CONFIG.userAgent,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data.json?.errors?.length > 0) {
            throw new Error(response.data.json.errors[0][1]);
        }

        res.status(200).json({
            success: true,
            message: 'Post submitted successfully',
            postId: response.data.json.data.id,
            url: `https://reddit.com${response.data.json.data.permalink}`
        });

    } catch (error) {
        console.error('[REDDIT POST ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

// Devvit integration - Create Reddit app
const createDevvitApp = async (req, res) => {
    try {
        const { appName, description, subreddit } = req.body;
        
        // This would integrate with Devvit CLI
        // For now, return instructions
        res.status(200).json({
            success: true,
            message: 'Devvit app creation initiated',
            instructions: [
                '1. Install Devvit CLI: npm install -g @devvit/cli',
                '2. Create new app: devvit new my-reddit-app',
                '3. Configure your app in the generated directory',
                '4. Deploy: devvit deploy',
                `5. Your app will be available at: https://reddit.com/r/${subreddit}`
            ],
            devvitCommand: `npm create devvit@latest ${appName}`
        });

    } catch (error) {
        console.error('[DEVVIT APP ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getRedditAuthUrl,
    handleRedditCallback,
    getRedditUserInfo,
    getUserSubreddits,
    postToReddit,
    createDevvitApp
};
