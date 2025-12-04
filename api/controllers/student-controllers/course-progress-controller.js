const CourseProgress = require("../../modals/course-Progress");
const Course = require("../../modals/course");
const StudentCourses = require("../../modals/student-courses");

//mark current lecture as viewed

const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        completionDate: null,
        lecturesProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
      });
      await progress.save();
    } else {
      const lecturesProgressItem = progress?.lecturesProgress?.find(
        (item) => item.lectureId === lectureId
      );

      if (lecturesProgressItem) {
        (lecturesProgressItem.viewed = true),
          (lecturesProgressItem.dateViewed = new Date());
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
        await progress.save();
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      //check all the lectures
      const allLecturesViewed =
        progress?.lecturesProgress?.length === course?.curriculum?.length &&
        progress.lecturesProgress.every((item) => item.viewed);

      if (allLecturesViewed) {
        (progress.completed = true), (progress.completionDate = new Date());
        await progress.save();
      }

      return res
        .status(200)
        .json({ success: true, message: "Lecture marked as viewed", progress });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error marking current lecture as viewed",
    });
  }
};


const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const studentPurchasedCourses = await StudentCourses.findOne({ userId });
    const isCurrentCoursePurchasedByCurrentUser =
      studentPurchasedCourses?.courses?.findIndex(
        (item) => item.courseId === courseId
      ) > -1;

    if (!isCurrentCoursePurchasedByCurrentUser) {
      return res.status(200).json({
        success: true,
        isPurchased: false,
        message: "You need to purchase this course to access it",
      });
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      const course = await Course.findById(courseId);

      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        courseDetails: course,
        progress: [],
        isPurchased: true,
      });
    }

    const courseDetails = await Course.findById(courseId);

    return res.status(200).json({
      success: true,
      message: "",
      courseDetails,
      currentUserCourseProgress,
      progress: currentUserCourseProgress?.lecturesProgress,
      isCompleted: currentUserCourseProgress?.completed,
      completionDate: currentUserCourseProgress?.completionDate,
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
    const { userId, courseId } = req.body;
    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Course progress not found" });
    }

    progress.lecturesProgress = [];
    (progress.completed = false), (progress.completionDate = null);

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
