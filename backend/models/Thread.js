const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: {
      type: [String], // Store image URLs as an array of strings
      default: [],
    },
  },
  {
    collection: "threads",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Custom timestamps
  }
);

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;