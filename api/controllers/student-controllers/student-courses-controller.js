const StudentCourses = require("../../modals/student-courses");
const Course = require("../../modals/course");
const mongoose = require("mongoose");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }
    if (String(req.user._id) !== String(studentId)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own purchased courses",
      });
    }
    const coursesList = await StudentCourses.findOne({ userId: String(req.user._id) })
      .select("-__v")
      .lean();

    if (!coursesList) {
      return res.status(200).json({
        success: true,
        message: "No courses purchased yet",
        courses: [],
      });
    }
    const courseIds = coursesList.courses.map((course) => course.courseId);
    const existingCourses = await Course.find({
      _id: { $in: courseIds },
    })
      .select("_id")
      .lean();
    const existingCourseIds = new Set(
      existingCourses.map((course) => String(course._id))
    );
    const courses = coursesList.courses.filter((course) =>
      existingCourseIds.has(String(course.courseId))
    );
    return res.status(200).json({
      success: true,
      message: "Courses bought by student fetched successfully",
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching courses by student id",
    });
  }
};

module.exports = getCoursesByStudentId;
