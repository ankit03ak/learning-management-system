const {
  addNewCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
} = require("../../controllers/instructor-controllers/course-contollers");


const router = require("express").Router();

router.post("/add",addNewCourse );
router.get("/get/:instructorId",getAllCourses );
router.get("/get/details/:id", getCourseDetailsById);
router.put("/update/:id", updateCourseById);


module.exports = router