const router = require("express").Router();
const getCoursesByStudentId = require("../../controllers/student-controllers/student-courses-controller");
const { authenticate } = require("../../middleware/auth-middleware");
const { authorizeRoles } = require("../../middleware/authorization");

router.get(
  "/get/:studentId",
  authenticate,
  authorizeRoles("student"),
  getCoursesByStudentId
);
 
module.exports = router;
