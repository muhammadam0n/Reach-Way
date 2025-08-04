const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/threads'); // Save images in threads folder
    } else if (file.fieldname === 'email') {
      cb(null, 'uploads/temp'); // Save Excel files in temporary storage
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024,
      fieldSize: 20 * 1024 * 1024
     }, // 2MB limit
    fileFilter: (req, file, cb) => {
      const isImage = /jpeg|jpg|png/.test(file.mimetype);      
      if ((file.fieldname === "image" && isImage)) {
        cb(null, true);
      } else {
        cb(new Error("Only images (JPEG, JPG, PNG) and Excel files (XLSX) are allowed"));
      }
      
    },
  }).fields([
    { name: "images", maxCount: 5 },
  ]);

const createPost = async (req, res) => {
    upload(req, res, async (err) => {
        const { userId, threads, facebookAccessToken } = req.body; // Add facebookAccessToken
        const threadsArray = threads; //parse the threads string into an array.
        const images = req.files ? req.files.map((file) => file.path) : [];
      
        if (!userId || !facebookAccessToken || !threadsArray) {
          return res.status(400).json({ error: "Missing required fields" });
        }
      
        try {
          let facebookPostId = null;
          let combinedContent = threadsArray.join('\n'); //combine all the threads into one string.
      
          if (combinedContent || images.length > 0) {
            const formData = new FormData();
            formData.append("message", combinedContent);
            images.forEach((imagePath) => {
              const fileStream = fs.createReadStream(imagePath);
              formData.append("file", fileStream);
            });
            const facebookResponse = await fetch(
              `https://i.instagram.com/api/v1/media/configure_text_only_post/`,
              {
                method: "POST",
                body: formData,
              }
            );
      
            if (!facebookResponse.ok) {
              const facebookError = await facebookResponse.json();
              console.error("Facebook Post Error:", facebookError);
              return res
                .status(500)
                .json({ error: "Failed to post on Facebook", facebookError });
            }
      
            const facebookData = await facebookResponse.json();
            facebookPostId = facebookData.post_id;
          }
      
    
          // 2. Save to Database
          const newThread = await Thread.create({
            userId,
            content: threadContent,
            images: images.length > 0 ? JSON.stringify(images) : null,
            facebookPostId: facebookPostId, // Store the facebookPostId
          });
    
          res
            .status(201)
            .json({ message: 'Thread posted successfully', thread: newThread });
        } catch (error) {
          console.error('Error creating thread:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
};
module.exports={createPost}