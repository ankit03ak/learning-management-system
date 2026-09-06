const mongoose = require("mongoose");
const objectIdString = {
  type: String,
  trim: true,
  validate: {
    validator: (value) => mongoose.isValidObjectId(value),
    message: "Invalid ObjectId",
  },
};

const LectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    videoUrl: { type: String, required: true, trim: true, maxlength: 2048 },
    freePreview: { type: Boolean, default: false },
    public_id: { type: String, trim: true, maxlength: 255 },
  },
  { _id: true }
);

const CourseSchema = new mongoose.Schema(
  {
    instructorId: { ...objectIdString, required: true },
    instructorName: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: Date, default: Date.now },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    level: { type: String, required: true, trim: true, maxlength: 50 },
    primaryLanguage: { type: String, required: true, trim: true, maxlength: 50 },
    subtitle: { type: String, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    pricing: { type: Number, required: true, min: 0, max: 1000000 },
    objectives: { type: String, trim: true, maxlength: 5000 },
    welcomeMessage: { type: String, trim: true, maxlength: 5000 },
    image: { type: String, trim: true, maxlength: 2048 },
    imagePublicId: { type: String, trim: true, maxlength: 255 },
    students: [
      {
        studentId: { ...objectIdString, required: true },
        studentName: { type: String, required: true, trim: true, maxlength: 100 },
        studentEmail: { type: String, required: true, trim: true, maxlength: 320 },
        paidAmount: { type: Number, required: true, min: 0 },
      },
    ],
    curriculum: {
      type: [LectureSchema],
      default: [],
      validate: {
        validator: (value) => value.length <= 500,
        message: "A course cannot contain more than 500 lectures",
      },
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CourseSchema.index({ instructorId: 1, createdAt: -1 });
CourseSchema.index({ isPublished: 1, pricing: 1 });

module.exports = mongoose.model("Course", CourseSchema);
