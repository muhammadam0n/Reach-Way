const express = require("express")
const cors = require("cors")
const dotenv = require('dotenv')
const connectDB = require('./db.js')
const userRoutes = require("./Routes/userRoutes.js");
const facebookRoutes = require("./Routes/facebookRoutes.js");
const postRoutes = require("./Routes/postRoutes.js");
const threadRoutes = require("./Routes/threadRoutes.js");
const LinkedinRoutes = require("./Routes/LinkedinRoutes.js");
const Post = require("./models/PostModel.js");
const cron = require("node-cron")
const { default: axios } = require("axios");
const app = express();
dotenv.config();
app.use(express.json());
connectDB();



// const getPostInsights = async (postId) => {
//   const response = await axios.get(
//     `https://graph.facebook.com/v19.0/738846689312114_122109942296956062/insights`,
//     {
//       params: {
//         metric: 'post_impressions,post_engaged_users,post_reactions_by_type_total',
//         access_token: 'EAAKf9m3z6qsBPMgbxDuzqPh3UENDfyIduBoDluexE35Q7Q8tfnyoSde2bUEJmmhlGWfkkC72SbHqdho7yAqVSmLZC0iKxLnAcG2pPfKDnvzghRZBWVvPtHY8XZBPCepbwGXJGrt4StAHl1JNsTVuc8nzndPSuHKR1ONsTXCHhBX5jVLFhOj7ozRI1jZB6KenaBtlIuLQ'
//       }
//     }
//   );

//   console.log("res:", response);
  
//   return response.data.data;
// };

// const getPostInsight = await getPostInsights();

// console.log("[GET POST INSIGHTS]:", getPostInsight)

function isScheduledTimePassed(scheduledTime) {
  const scheduledDate = new Date(scheduledTime);
  const currentDate = new Date();

  return currentDate >= scheduledDate;
}

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


async function postToInsta(mediaId) {
  try {
    const PAGE_ACCESS_TOKEN = await getPageToken();
    const postedOnInstaResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.INTA_BUS_ACC_ID}/media_publish`,
      { creation_id: mediaId },
      { params: { access_token: PAGE_ACCESS_TOKEN?.pageToken } }
    );

    console.log("[postedOnInstaResponse]:", postedOnInstaResponse?.data);
    return postedOnInstaResponse;
  } catch (err) {
    console.log("[ERROR WHILE PUTTING IT OVER INSTA]:", err);
    return err;
  }
}

async function processScheduledPosts() {
  const unProcessedPosts = await Post.find({
    isProcessed: false
  });

  console.log("[UNPROCESSED INSTA POSTS]:", unProcessedPosts);

  for (const post of unProcessedPosts) {
    try {

      console.log(`Processing post ${post._id} with description: ${post.description}`);
      const checkIfScheduleTimePassed = isScheduledTimePassed(post?.scheduledDateTime);
      console.log("[CHECK IF WE CAN SCHEDULE]:", checkIfScheduleTimePassed);
      if (checkIfScheduleTimePassed) {
        console.log("[ATTEMPTING TO POST IT OVER INSTA......]");
        const result = postToInsta(post?.mediaId);

        if (result) {
          const updatePostProcessStatus = await Post.updateOne({
            _id: post?._id
          }, {
            $set: { isProcessed: true }
          });
          console.log("[UPDATED POST PROCESS STATUS]:", updatePostProcessStatus);
        }
      } else {
        console.log("NO POSTS TO UPLOAD");
      }


    } catch (error) {
      console.error(`Failed to process post ${post._id}:`, error);
    }
  }

}

cron.schedule('* * * * *', async () => {
  console.log('⏳ Scheduler running...');
  try {
    await processScheduledPosts();
  } catch (error) {
    console.error('❌ Scheduler error:', error);
  } finally {
    this.isRunning = false;
  }
});

app.use(cors({
  origin: "*", // Allow all origins (replace '*' with specific origins if needed)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
app.use('/uploads', express.static(`${__dirname}/uploads`));
app.use('/api', facebookRoutes);
app.use('/api', userRoutes);
app.use("/api", LinkedinRoutes);

app.use("/api", postRoutes);
app.use("/api", threadRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));