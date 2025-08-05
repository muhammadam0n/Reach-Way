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
  },
  {
    collection: "posts", 
    timestamps: true, 
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;