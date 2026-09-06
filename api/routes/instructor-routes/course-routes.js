const {
  addNewCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
  deleteCourseById,
} = require("../../controllers/instructor-controllers/course-contollers");
const { authenticate } = require("../../middleware/auth-middleware");
const { authorizeRoles } = require("../../middleware/authorization");

const router = require("express").Router();
const instructorOnly = [authenticate, authorizeRoles("instructor")];

router.post("/add", ...instructorOnly, addNewCourse);
router.get("/get/:instructorId", ...instructorOnly, getAllCourses);
router.get("/get/details/:id", ...instructorOnly, getCourseDetailsById);
router.put("/update/:id", ...instructorOnly, updateCourseById);
router.delete("/delete/:id", ...instructorOnly, deleteCourseById);


module.exports = router