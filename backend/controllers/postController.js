const Post = require("../models/PostModel");
const multer = require("multer");
const path = require("path");

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
            const { userId, platform, description, postType,pageID,date } = req.body;          
            if (!userId || !platform || !postType) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            
            const image =  req.file;

            const newPost = new Post({
                userId,
                pageID,
                // postId,
                platform,
                postType,
                image: image?.path || "",
                description,
                date
            });

            await newPost.save();

            res.status(201).json({ message: "Post saved successfully", post: newPost });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error", details: error.message });
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

module.exports = {
    savePost,
    getPosts,
};
