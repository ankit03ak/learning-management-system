const Course = require("../../modals/course");

const addNewCourse = async (req, res) => {
  try {
    const savedCourse = await Course.create(req.body);

    return res.status(201).json({
      success: true,
      message: "New Course created successfully",
      course: savedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating new course",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({
      success: false,
      message: "Instructor ID is required",
    });
    }


    const courseList = await Course.find({ instructorId });

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

const getCourseDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Error fetching course details",
      });
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
    const update = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Error updating course",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating course",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
};
