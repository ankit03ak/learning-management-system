const router = require("express").Router();

const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCoursesProgress,
} = require("../../controllers/student-controllers/course-progress-controller");

router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCoursesProgress);

module.exports = router;
