const router = require("express").Router();

const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCoursesProgress,
} = require("../../controllers/student-controllers/course-progress-controller");
const { authenticate } = require("../../middleware/auth-middleware");
const { authorizeRoles } = require("../../middleware/authorization");

const studentOnly = [authenticate, authorizeRoles("student")];
router.get("/get/:userId/:courseId", ...studentOnly, getCurrentCourseProgress);
router.post("/mark-lecture-viewed", ...studentOnly, markCurrentLectureAsViewed);
router.post("/reset-progress", ...studentOnly, resetCoursesProgress);

module.exports = router;
