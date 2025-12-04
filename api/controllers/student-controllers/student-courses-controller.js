const StudentCourses = require("../../modals/student-courses");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const coursesList = await StudentCourses.findOne({ userId: studentId });

    if (!coursesList) {
      return res.status(404).json({
        success: false,
        message: "Error fetching courses by student id",
      });
    }
    const courses = coursesList.courses;
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
