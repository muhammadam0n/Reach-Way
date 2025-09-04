const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    // postId: {
    //   type: String,
    //   required: true,
    // },
    description: {
      type: String, // Mongoose `String` is equivalent to Sequelize `TEXT`
      default: "",
    },
    pageID: {
      type: String, // Storing image URL
      default: "",
    },
    image: {
      type: String, // Storing image URL
      default: "",
    },
    platform: {
      type: String,
      // enum: ["facebook", "instagram"],
      required: true,
    },
    postType: {
      type: String,
      // enum: ["profile", "page", "group"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status:{
      type: String,
      enum: ["post", "posted"],
      default: "post",
    },
    socialMediaPostId: {
        type: String,
        default: ""
    },
    mediaId: {
        type: String, 
        default: ""
    },
    scheduledDateTime: {
        type: Date, 
    },
    isProcessed: {
      type: Boolean,
      default: false
    },
    // New Analytics Fields
    analytics: {
      reach: {
        type: Number,
        default: 0
      },
      impressions: {
        type: Number,
        default: 0
      },
      engagement: {
        type: Number,
        default: 0
      },
      likes: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      saves: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    // Platform-specific analytics
    platformAnalytics: {
      facebook: {
        reach: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        reactions: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
      },
      instagram: {
        reach: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
      },
      linkedin: {
        reach: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        reactions: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
      }
    },
    // Performance metrics
    performance: {
      engagementRate: { type: Number, default: 0 },
      reachRate: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      bestPerformingTime: { type: String, default: "" },
      audienceDemographics: {
        ageRange: { type: String, default: "" },
        gender: { type: String, default: "" },
        location: { type: String, default: "" }
      }
    }
  },
  {
    collection: "posts", 
    timestamps: true, 
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;