const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
const MediaAsset = require("../../../modals/media-asset");

const {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../../helpers/cloudinary");
const { authenticate } = require("../../../middleware/auth-middleware");
const { authorizeRoles } = require("../../../middleware/authorization");
const { createRateLimiter } = require("../../../middleware/rate-limit");

const router = express.Router();
const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many upload requests, please try again later",
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

const upload = multer({
  dest: path.join(os.tmpdir(), "lms-uploads"),
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    return callback(null, true);
  },
});

const removeTemporaryFile = async (file) => {
  if (!file || !file.path) return;
  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Unable to remove upload", error);
  }
};

const validPublicId = (id) =>
  typeof id === "string" &&
  id.length <= 255 &&
  /^lms_uploads\/[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(id);

router.post(
  "/upload",
  uploadRateLimit,
  authenticate,
  authorizeRoles("instructor"),
  upload.single("file"),
  async (req, res) => {
    let result;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "A file is required" });
    }
    result = await uploadMediaToCloudinary(req.file.path);
    await MediaAsset.create({
      publicId: result.public_id,
      ownerId: String(req.user._id),
      resourceType: result.resource_type || "auto",
    });
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully via upload media route",
      result,
    });
  } catch (error) {
    console.error("Error uploading via media route", error);
    if (result && result.public_id) {
      await deleteMediaFromCloudinary(result.public_id, result.resource_type);
    }
    return res
      .status(500)
      .json({ success: false, message: "Error uploading via media route" });
  } finally {
    await removeTemporaryFile(req.file);
  }
  }
);

router.delete(
  "/delete/:id",
  authenticate,
  authorizeRoles("instructor"),
  async (req, res) => {
  try {
    const id = req.params.id;
    if (!validPublicId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid asset ID" });
    }

    const asset = await MediaAsset.findOne({
      publicId: id,
      ownerId: String(req.user._id),
    });
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found or not owned by the current instructor",
      });
    }
    await deleteMediaFromCloudinary(id, asset.resourceType);
    await MediaAsset.deleteOne({ _id: asset._id });

    return res.status(200).json({
      success: true,
      message: "File deleted via media route",
    });
  } catch (error) {
    console.error("Error deleting via media route", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting via media route" });
  }
  }
);

router.post(
  "/bulk-upload",
  uploadRateLimit,
  authenticate,
  authorizeRoles("instructor"),
  upload.array("files", 10),
  async (req, res) => {
  const files = req.files || [];
  const uploadedAssets = [];
  try {
    if (!files.length) {
      return res.status(400).json({ success: false, message: "At least one file is required" });
    }
    const results = [];
    for (const fileItem of files) {
      const result = await uploadMediaToCloudinary(fileItem.path);
      uploadedAssets.push(result);
      await MediaAsset.create({
        publicId: result.public_id,
        ownerId: String(req.user._id),
        resourceType: result.resource_type || "auto",
      });
      results.push(result);
    }
    return res.status(200).json({
      success: true,
      message: "Bulk upload successful",
      result: results,
    });
  } catch (error) {
    console.error("Error bulk uploading files", error);
    if (uploadedAssets.length) {
      await Promise.all(
        uploadedAssets.map((asset) =>
          deleteMediaFromCloudinary(asset.public_id, asset.resource_type)
        )
      );
    }
    return res
      .status(500)
      .json({ success: false, message: "Error bulk uploading files" });
  } finally {
    await Promise.all(files.map(removeTemporaryFile));
  }
  }
);

module.exports = router;
