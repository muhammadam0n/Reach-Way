const { default: axios } = require("axios");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'image') {
        cb(null, 'uploads/linkedin'); // Save images in blogs folder
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
     },
    fileFilter: (req, file, cb) => {
      const isImage = /jpeg|jpg|png/.test(file.mimetype);
      if ((file.fieldname === "image" && isImage)) {
        cb(null, true);
      } else {
        cb(new Error("Only images (JPEG, JPG, PNG) and Excel files (XLSX) are allowed"));
      }
      
    },
  }).fields([
    { name: "image", maxCount: 1 }, // For the blog image
  ]);

const LinkedinPost = async (req, res) => {
    upload(req, res, async (err) => {
        const { accessToken, userURN, text } = req.body;
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(500).json({ message: "File size exceeds 5MB limit" });
            }
            return res.status(400).json({ message: "File upload error: " + err.message });
        } else if (err) {
            return res.status(400).json({ message: "Error: " + err.message });
        }

        try {
            const { files } = req;
            const image = files?.image[0]; // Ensure an image file is provided

            if (!image) {
                return res.status(400).json({ error: "No image file provided." });
            }
            const formData = new FormData();
            formData.append("registerUploadRequest", JSON.stringify({
                owner: userURN,
                recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                serviceRelationships: [
                    { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }
                ],
                supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"]
            }));
            /** STEP 1: REGISTER IMAGE UPLOAD **/
            const registerResponse = await fetch(
                "https://api.linkedin.com/v2/assets?action=registerUpload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        registerUploadRequest: {
                            owner: userURN,
                            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                            serviceRelationships: [
                                { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
                            ],
                            supportedUploadMechanism:[
                            "SYNCHRONOUS_UPLOAD"
                            ]
                        },
                    }),
                }
            );

            const uploadData = await registerResponse.json();
            // console.log("Upload Registration Response:", uploadData);

            if (!registerResponse.ok || !uploadData.value || !uploadData.value.asset) {
                // console.error("❌ Failed to register image with LinkedIn:", uploadData);
                return res.status(registerResponse.status || 400).json({
                    error: "Failed to register image with LinkedIn",
                    details: uploadData,
                });
            }

            const assetURN = uploadData.value.asset; // ✅ Extract assetURN
            // console.log("✅ Asset URN:", assetURN);

            /** STEP 2: UPLOAD IMAGE TO LINKEDIN **/
            const uploadUrl =
                uploadData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]
                    .uploadUrl;
            const imageBuffer = fs.readFileSync(image.path);
            
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "image/png", // Change based on your file type
                },
                body: imageBuffer,
            });

            if (!uploadResponse.ok) {
                const uploadError = await uploadResponse.text();
                console.error("❌ LinkedIn Image Upload Error:", uploadError);
                return res.status(uploadResponse.status || 400).json({
                    error: "Failed to upload image to LinkedIn",
                    details: uploadError,
                });
            }

            const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    author: userURN,
                    lifecycleState: "PUBLISHED",
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": {
                            shareCommentary: { text },
                            shareMediaCategory: "IMAGE",
                            media: [{ status: "READY", media: assetURN }],
                        },
                    },
                    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
                }),
            });

            const responseData = await response.json();

            return res.status(200).json(responseData);
        } catch (error) {
            // console.error("❌ Error creating LinkedIn post:", error);
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    });
};


const postToLinkedIn = async (req, res) => {
    const { accessToken, postData } = req.body;
  
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }
  
    try {
      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );
  
      res.status(200).json({ message: "Post created successfully", id: response.data.id });
    } catch (error) {
      // console.error("Error posting to LinkedIn:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to post to LinkedIn", details: error.response?.data });
    }
  };

const getLinkedInProfile=async(req,res)=>{
  const accessToken = req.query.accessToken;
  
  try {
        const response = await fetch("https://api.linkedin.com/v2/userinfo", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0",
              },
        });
  
        const data = await response.json();
        if (data.sub) {
            res.json({ urn: `urn:li:person:${data.sub}` });
        } else {
          // console.log("id ",data);
          
            res.status(400).json({ error: data });
        }
    } catch (error) {
        // console.error("Error fetching LinkedIn profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const getLinkedInToken=async(req,res)=>{
    try {
      const { code } = req.body;

      const params = new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
      });

      const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", params.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      res.json(response.data); // Send access token back to frontend
  } catch (error) {
      // console.error("LinkedIn Token Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch access token", details: error.response?.data });
  }
  }
  

module.exports={LinkedinPost,getLinkedInToken,getLinkedInProfile,postToLinkedIn};