const mongoose = require("mongoose");

const LectureProgressSchema = new mongoose.Schema({
  lectureId: {
    type: String,
    required: true,
    trim: true,
    validate: { validator: mongoose.isValidObjectId, message: "Invalid lecture ID" },
  },
  viewed: { type: Boolean, default: false },
  dateViewed: { type: Date, default: null },
});

const CourseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid user ID" },
    },
    courseId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid course ID" },
    },
    completed: { type: Boolean, default: false },
    completionDate: { type: Date, default: null },
    lecturesProgress: [LectureProgressSchema],
  },
  { timestamps: true }
);

CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", CourseProgressSchema);
