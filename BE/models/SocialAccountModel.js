const mongoose = require("mongoose");

const socialAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["facebook", "instagram", "linkedin", "twitter", "tiktok", "reddit"],
      required: true,
    },
    accountType: {
      type: String,
      enum: ["personal", "business", "page", "group", "subreddit"],
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    pageId: {
      type: String,
      default: "",
    },
    pageAccessToken: {
      type: String,
      default: "",
    },
    instagramBusinessAccountId: {
      type: String,
      default: "",
    },
    linkedinCompanyId: {
      type: String,
      default: "",
    },
    // TikTok specific fields
    tiktokAccessToken: {
      type: String,
      default: "",
    },
    tiktokRefreshToken: {
      type: String,
      default: "",
    },
    tiktokOpenId: {
      type: String,
      default: "",
    },
    tiktokUnionId: {
      type: String,
      default: "",
    },
    // Reddit specific fields
    redditClientId: {
      type: String,
      default: "",
    },
    redditClientSecret: {
      type: String,
      default: "",
    },
    redditUsername: {
      type: String,
      default: "",
    },
    redditSubreddits: [{
      name: String,
      id: String,
      permissions: [String]
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    posts: {
      type: Number,
      default: 0,
    },
    lastSync: {
      type: Date,
      default: Date.now,
    },
    permissions: {
      publish: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      manage: { type: Boolean, default: false },
    },
    settings: {
      autoPost: { type: Boolean, default: false },
      postFrequency: { type: String, default: "manual" },
      timezone: { type: String, default: "UTC" },
      language: { type: String, default: "en" },
    },
    metadata: {
      category: { type: String, default: "" },
      industry: { type: String, default: "" },
      location: { type: String, default: "" },
      website: { type: String, default: "" },
      description: { type: String, default: "" },
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
socialAccountSchema.index({ userId: 1, platform: 1 });
socialAccountSchema.index({ accountId: 1, platform: 1 });

const SocialAccount = mongoose.model("SocialAccount", socialAccountSchema);

module.exports = SocialAccount;
