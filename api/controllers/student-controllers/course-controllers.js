const mongoose = require("mongoose");
const Course = require("../../modals/course");
const StudentCourses = require("../../modals/student-courses");

const publicProjection = "-students -__v";
const parseFilter = (value) => {
  if (Array.isArray(value)) return value.slice(0, 20);
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
};

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      primaryLanguage,
      sortBy = "price-lowtohigh",
    } = req.query;
    const page = Math.max(1, Math.min(Number.parseInt(req.query.page, 10) || 1, 10000));
    const limit = Math.max(
      1,
      Math.min(Number.parseInt(req.query.limit, 10) || 20, 50)
    );
    const filters = { isPublished: true };
    const categoryValues = parseFilter(category);
    const levelValues = parseFilter(level);
    const languageValues = parseFilter(primaryLanguage);

    if (categoryValues.length) filters.category = { $in: categoryValues };
    if (levelValues.length) filters.level = { $in: levelValues };
    if (languageValues.length) filters.primaryLanguage = { $in: languageValues };

    const sortParam = {
      "price-lowtohigh": { pricing: 1 },
      "price-hightolow": { pricing: -1 },
      "title-atoz": { title: 1 },
      "title-ztoa": { title: -1 },
    }[sortBy] || { pricing: 1 };

    const courseList = await Course.find(filters)
      .select(publicProjection)
      .sort(sortParam)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courseList,
      page,
      limit,
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
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const courseDetails = await Course.findOne({
      _id: id,
      isPublished: true,
    }).select(publicProjection);

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
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid identifier" });
    }
    if (String(req.user._id) !== String(studentId)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own purchase information",
      });
    }

    const purchased = await StudentCourses.exists({
      userId: String(req.user._id),
      "courses.courseId": String(id),
    });

    return res.status(200).json({ success: true, boughtOrNot: Boolean(purchased) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking course bought or not",
    });
  }
};

module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};
