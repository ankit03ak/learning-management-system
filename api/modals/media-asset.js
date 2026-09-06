const mongoose = require("mongoose");

const MediaAssetSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, trim: true },
    ownerId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid owner ID" },
    },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw", "auto"],
      default: "auto",
    },
  },
  { timestamps: true }
);

MediaAssetSchema.index({ ownerId: 1, publicId: 1 }, { unique: true });

module.exports = mongoose.model("MediaAsset", MediaAssetSchema);
