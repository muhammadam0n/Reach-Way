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

const savePost = (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(500).json({ message: "File size exceeds 5MB limit" });
            }
            return res.status(400).json({ message: "File upload error: " + err.message });
        } else if (err) {
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
                date
            });

            const savedPost = await newPost.save();

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

                const scheduledPost =
                    await scheduleFacebookPost({
                        pageId: pageAccessToken?.pageId,
                        pageToken: pageAccessToken?.pageToken,
                        message: description,
                        scheduleTime: formattedDateTime,
                        mediaId: uploadedImage?.mediaId
                    })

                console.log("[SCHEDULED POST]:", scheduledPost);

            } else if (platform === 'instagram') {
                const PAGE_ACCESS_TOKEN = await getPageToken();

                const formattedDate = convertToInstagramTimestamp(date, time);
                const canProceed = validateInstagramScheduleTime(formattedDate);
                console.log("[IMAGE]:", image);
                const uploadedImageUrl = await uploadToCloudinary(image.path);
                console.log("[uploaded image url]:", uploadedImageUrl);

                if (canProceed?.valid) {
                    // const getInstaUserId = await getInstagramUserId(PAGE_ACCESS_TOKEN?.instagramPageId, PAGE_ACCESS_TOKEN?.pageToken);
                    // console.log("[GET INSTA USER ID]:", getInstaUserId);

                    const uploadRes = await axios.post(
                        `https://graph.facebook.com/v19.0/${process.env.INTA_BUS_ACC_ID}/media`,
                        {
                            image_url: uploadedImageUrl?.url,
                            caption: description,
                            published: true,
                            // scheduled_publish_time: formattedDate
                        },
                        { params: { access_token: PAGE_ACCESS_TOKEN?.pageToken } }
                    );
                    console.log("[SCHEDULED INSTA POST]:", uploadRes);
                    const mediaId = uploadRes?.data?.id;

                    const postedOnInstaResponse = await axios.post(
                        `https://graph.facebook.com/v19.0/${process.env.INTA_BUS_ACC_ID}/media_publish`,
                        { creation_id: mediaId },
                        { params: { access_token: PAGE_ACCESS_TOKEN?.pageToken } }
                    );

                    console.log("[postedOnInstaResponse]:", postedOnInstaResponse?.data);
                }
            }

            res.status(201).json({ message: "Post saved successfully", post: newPost });
        } catch (error) {
            const {
                response: {
                    data: {
                        error: {
                            message = 'Unknown Instagram API error',
                            type = 'GraphAPIError',
                            code = -1,
                            error_subcode: subcode,
                            error_user_title: userTitle,
                            error_user_msg: userMessage,
                            fbtrace_id
                        } = {}
                    } = {}
                } = {},
                config: {
                    // method,
                    url
                }
            } = error;

            console.error('Instagram API Failure:', {
                errorCode: code,          // e.g. 3 for whitelist error
                errorType: type,          // e.g. "OAuthException"
                userMessage,              // User-friendly message
                technicalDetails: message,// Developer details
                request: {
                    method: "POST",                 // "POST"
                    endpoint: url.split('?')[0] // Clean URL
                },
                traceId: fbtrace_id       // For Facebook debugging
            });
        }
    });
};



const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({});
        const postsWithDetails = posts.map((post) => ({
            ...post._doc,
            image: `${process.env.url}/${post.image.replace(/\\+/g, '/')}`,
        }));
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



module.exports = {
    savePost,
    getPosts,
};
