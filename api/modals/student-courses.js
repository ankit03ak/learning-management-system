const mongoose = require("mongoose");

const StudentCoursesSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: mongoose.isValidObjectId, message: "Invalid user ID" },
    },
    courses: [
      {
        courseId: {
          type: String,
          required: true,
          trim: true,
          validate: { validator: mongoose.isValidObjectId, message: "Invalid course ID" },
        },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        instructorId: {
          type: String,
          required: true,
          trim: true,
          validate: { validator: mongoose.isValidObjectId, message: "Invalid instructor ID" },
        },
        instructorName: { type: String, required: true, trim: true, maxlength: 100 },
        dateOfPurchase: { type: Date, required: true },
        courseImage: { type: String, trim: true, maxlength: 2048 },
      },
    ],
  },
  { timestamps: true }
);

StudentCoursesSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("StudentCourses", StudentCoursesSchema);
