const router = require("express").Router();

const {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
} = require("../../controllers/student-controllers/course-controllers");
const { authenticate } = require("../../middleware/auth-middleware");
const { authorizeRoles } = require("../../middleware/authorization");

router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.get(
  "/purchase-info/:id/:studentId",
  authenticate,
  authorizeRoles("student"),
  checkCoursePurchaseInfo
);

module.exports = router;
