const mongoose = require("mongoose");
const CourseProgress = require("../../modals/course-Progress");
const Course = require("../../modals/course");
const StudentCourses = require("../../modals/student-courses");

const getCourseAndVerifyPurchase = async (userId, courseId) => {
  if (!mongoose.isValidObjectId(courseId)) return { invalid: true };
  const course = await Course.findById(courseId).select("-students -__v");
  if (!course) return { notFound: true };
  const purchased = await StudentCourses.exists({
    userId: String(userId),
    "courses.courseId": String(courseId),
  });
  return { course, purchased: Boolean(purchased) };
};

const updateCompletion = (progress, course) => {
  const requiredLectureIds = new Set(
    course.curriculum.map((lecture) => String(lecture._id))
  );
  const viewedLectureIds = new Set(
    progress.lecturesProgress
      .filter((lecture) => lecture.viewed)
      .map((lecture) => String(lecture.lectureId))
  );
  const completed =
    requiredLectureIds.size > 0 &&
    [...requiredLectureIds].every((lectureId) => viewedLectureIds.has(lectureId));

  if (completed && !progress.completed) {
    progress.completed = true;
    progress.completionDate = new Date();
  }
  if (!completed && progress.completed) {
    progress.completed = false;
    progress.completionDate = null;
  }
};

const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { courseId, lectureId, userId } = req.body || {};
    const authenticatedUserId = String(req.user._id);
    if (userId && String(userId) !== authenticatedUserId) {
      return res.status(403).json({ success: false, message: "User identity mismatch" });
    }
    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lectureId)) {
      return res.status(400).json({ success: false, message: "Invalid course or lecture ID" });
    }

    const access = await getCourseAndVerifyPurchase(authenticatedUserId, courseId);
    if (access.invalid) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    if (access.notFound) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (!access.purchased) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase this course to access it",
      });
    }

    const lectureExists = access.course.curriculum.some(
      (lecture) => String(lecture._id) === String(lectureId)
    );
    if (!lectureExists) {
      return res.status(400).json({ success: false, message: "Lecture does not belong to this course" });
    }

    let progress = await CourseProgress.findOne({
      userId: authenticatedUserId,
      courseId: String(courseId),
    });
    if (!progress) {
      progress = new CourseProgress({
        userId: authenticatedUserId,
        courseId: String(courseId),
        completed: false,
        completionDate: null,
        lecturesProgress: [],
      });
    }

    let lectureProgress = progress.lecturesProgress.find(
      (item) => String(item.lectureId) === String(lectureId)
    );
    if (!lectureProgress) {
      progress.lecturesProgress.push({
        lectureId: String(lectureId),
        viewed: true,
        dateViewed: new Date(),
      });
    } else {
      lectureProgress.viewed = true;
      lectureProgress.dateViewed = new Date();
    }

    updateCompletion(progress, access.course);
    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      progress,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Progress was updated concurrently; please retry",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error marking current lecture as viewed",
    });
  }
};

const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(courseId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid identifier" });
    }
    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "User identity mismatch" });
    }

    const access = await getCourseAndVerifyPurchase(userId, courseId);
    if (access.notFound) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (!access.purchased) {
      return res.status(200).json({
        success: true,
        isPurchased: false,
        message: "You need to purchase this course to access it",
      });
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId: String(userId),
      courseId: String(courseId),
    });
    if (!currentUserCourseProgress || currentUserCourseProgress.lecturesProgress.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        courseDetails: access.course,
        progress: [],
        isPurchased: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "",
      courseDetails: access.course,
      currentUserCourseProgress,
      progress: currentUserCourseProgress.lecturesProgress,
      isCompleted: currentUserCourseProgress.completed,
      completionDate: currentUserCourseProgress.completionDate,
      isPurchased: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching current course progress",
    });
  }
};

const resetCoursesProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.body || {};
    const authenticatedUserId = String(req.user._id);
    if (userId && String(userId) !== authenticatedUserId) {
      return res.status(403).json({ success: false, message: "User identity mismatch" });
    }
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const access = await getCourseAndVerifyPurchase(authenticatedUserId, courseId);
    if (access.notFound) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (!access.purchased) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase this course to access it",
      });
    }

    const progress = await CourseProgress.findOne({
      userId: authenticatedUserId,
      courseId: String(courseId),
    });
    if (!progress) {
      return res.status(404).json({ success: false, message: "Course progress not found" });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;
    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error reseting course progress",
    });
  }
};

module.exports = {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCoursesProgress,
};
