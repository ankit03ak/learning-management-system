const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  freePreview: Boolean,
  public_id: String,
});

const CourseSchema = new mongoose.Schema(
  {
    instructorId: String,
    instructorName: String,
    date: Date,
    title: String,
    category: String,
    level: String,
    primaryLanguage: String,
    subtitle: String,
    description: String,
    pricing: Number,
    objectives: String,
    welcomeMessage: String,
    image: String,
    imagePublicId: String,
    students: [
      {
        studentId: String,
        studentName: String,
        studentEmail: String,
        paidAmount: Number,
      },
    ],
    curriculum: [LectureSchema],
    isPublished: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
