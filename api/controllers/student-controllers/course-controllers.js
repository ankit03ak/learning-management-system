const Course = require("../../modals/course");
const StudentCourses = require("../../modals/student-courses");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
    } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (level.length) {
      filters.level = { $in: level.split(",") };
    }

    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    let sortParam = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;
        break;

      case "price-hightolow":
        sortParam.pricing = -1;
        break;

      case "title-atoz":
        sortParam.title = 1;
        break;

      case "title-ztoa":
        sortParam.title = -1;
        break;

      default:
        sortParam.pricing = 1;
        break;
    }

    const courseList = await Course.find(filters).sort(sortParam);

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courseList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching all courses of student",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.log("id undefined");
      return;
    }

    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Error fetching details of the specific course",
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
      message: "Error fetching details of the specific course",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const coursesBoughtByCurrentStudent = await StudentCourses.findOne({
      userId: studentId,
    });
    


    const boughtOrNot =
      coursesBoughtByCurrentStudent?.courses?.findIndex(
        (item) => item.courseId === id
      ) > -1;


    return res.status(200).json({
      success: true,
      boughtOrNot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking course bought or not",
    });
  }
};

module.exports = { getAllStudentViewCourses, getStudentViewCourseDetails, checkCoursePurchaseInfo };
