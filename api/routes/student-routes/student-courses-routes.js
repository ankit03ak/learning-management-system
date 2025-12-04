const router = require("express").Router();
const getCoursesByStudentId = require("../../controllers/student-controllers/student-courses-controller");

router.get("/get/:studentId", getCoursesByStudentId);
 
module.exports = router;
