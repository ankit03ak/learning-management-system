const mongoose = require("mongoose");
const Course = require("../../modals/course");
const StudentCourses = require("../../modals/student-courses");

const writableFields = [
  "title",
  "category",
  "level",
  "primaryLanguage",
  "subtitle",
  "description",
  "pricing",
  "objectives",
  "welcomeMessage",
  "image",
  "imagePublicId",
  "curriculum",
  "isPublished",
  "date",
];

const pickWritableFields = (body = {}) =>
  writableFields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) result[field] = body[field];
    return result;
  }, {});

const publicCourseProjection =
  "-students -__v -createdAt -updatedAt -instructorId -instructorName";

const getAllCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    if (!mongoose.isValidObjectId(instructorId)) {
      return res.status(400).json({ success: false, message: "Invalid instructor ID" });
    }
    if (String(req.user._id) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "You can only access your own courses" });
    }

    const courseList = await Course.find({ instructorId })
      .select("-__v")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      courseList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching all courses",
    });
  }
};

const addNewCourse = async (req, res) => {
  try {
    const courseData = pickWritableFields(req.body);
    courseData.instructorId = String(req.user._id);
    courseData.instructorName = String(req.user.userName || "");
    courseData.date = courseData.date ? new Date(courseData.date) : new Date();

    const savedCourse = await Course.create(courseData);
    return res.status(201).json({
      success: true,
      message: "New Course created successfully",
      course: savedCourse,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid course data",
    });
  }
};

const getCourseDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const courseDetails = await Course.findOne({
      _id: id,
      instructorId: String(req.user._id),
    }).select("-students -__v");

    if (!courseDetails) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      courseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching course details",
    });
  }
};

const updateCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const update = pickWritableFields(req.body);
    delete update.instructorId;
    delete update.instructorName;
    delete update.students;

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: id, instructorId: String(req.user._id) },
      update,
      { new: true, runValidators: true }
    ).select("-students -__v");

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid course data",
    });
  }
};

const deleteCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const deletedCourse = await Course.findOneAndDelete({
      _id: id,
      instructorId: String(req.user._id),
    });

    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    await StudentCourses.updateMany(
      { "courses.courseId": String(id) },
      { $pull: { courses: { courseId: String(id) } } }
    );

    return res.status(200).json({
      success: true,
      message: "Course removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove course",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
  deleteCourseById,
  publicCourseProjection,
};
