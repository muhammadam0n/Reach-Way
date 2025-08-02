const mongoose = require("mongoose");

const roleModuleSchema = new mongoose.Schema(
  {
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // References the Role collection
      required: true,
    },
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module", // References the Module collection
      required: true,
    },
  },
  {
    collection: "role_modules", // Explicitly setting collection name
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Custom timestamps
  }
);

// Optional: Implement cascading delete if required
roleModuleSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (!doc) return next();
  // You can implement further cleanup logic here if needed.
  next();
});

const RoleModule = mongoose.model("RoleModule", roleModuleSchema);

module.exports = RoleModule;