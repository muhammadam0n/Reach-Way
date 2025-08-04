const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String, // Mongoose `String` is equivalent to Sequelize `TEXT`
    },
  },
  {
    collection: "modules", // Ensures collection name matches
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Auto-add timestamps
  }
);

const Module = mongoose.model("Module", moduleSchema);

module.exports = Module;