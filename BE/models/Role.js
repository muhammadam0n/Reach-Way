const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "roles", // Explicitly set collection name
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Custom field names
  }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
