const axios = require("axios");
const Post = require("../models/PostModel");

const createPost = async (req, res) => {
  const { posts } = req.body;

  if (!Array.isArray(posts) || posts.length === 0) {
    return res.status(400).json({ success: false, error: "No posts provided" });
  }

  const results = [];

  for (const post of posts) {
    const {
        _id,
      platform,
      message,
      image_url,
      scheduled_time,
      page_id,
      access_token
    } = post;

    try {
      let response;

      if (platform === "facebook") {
        // Schedule Facebook post
        const scheduledUnix = Math.floor(new Date(scheduled_time).getTime() / 1000);

        response = await axios.post(
          `https://graph.facebook.com/${page_id}/photos`,
          null,
          {
            params: {
              url: image_url,
              caption: message,
              published: false,
              scheduled_publish_time: scheduledUnix,
              access_token
            }
          }
        );
      } else if (platform === "instagram") {
        // Direct Instagram Post (immediately)
        const media = await axios.post(
          `https://graph.facebook.com/v18.0/${page_id}/media`,
          null,
          {
            params: {
              image_url,
              caption: message,
              access_token
            }
          }
        );

        const creationId = media.data.id;

        response = await axios.post(
          `https://graph.facebook.com/v18.0/${page_id}/media_publish`,
          null,
          {
            params: {
              creation_id: creationId,
              access_token
            }
          }
        );
      } else if (platform === "linkedin") {
        // Direct LinkedIn Post (image + text)
        // Requires the user/organization URN: `page_id` here should be in format: `urn:li:organization:xxxx` or `urn:li:person:xxxx`

        response = await axios.post(
          "https://api.linkedin.com/v2/ugcPosts",
          {
            author: page_id,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: message },
                shareMediaCategory: image_url ? "IMAGE" : "NONE",
                media: image_url
                  ? [
                      {
                        status: "READY",
                        originalUrl: image_url
                      }
                    ]
                  : []
              }
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0"
            }
          }
        );
      } else if (platform === "threads") {
         response = await axios.post(
          `https://graph.threads.net/v1.0/${page_id}/threads`,
          null,
          {
            params: {
              media_type: "TEXT",
              text: message,
              access_token
            }
          }
        );     
      }
       else {
        results.push({ platform, success: false, error: "Unsupported platform" });
        continue;
      }
      await Post.findByIdAndUpdate(_id, { status: "posted" });
      results.push({
        platform,
        success: true,
        response: response.data || response
      });
    } catch (error) {
      console.error(`${platform} error:`, error.response?.data || error.message);
      results.push({
        platform,
        success: false,
        error: error.response?.data || error.message
      });
    }
  }

  res.json({ success: true, results });
};


module.exports = { createPost };