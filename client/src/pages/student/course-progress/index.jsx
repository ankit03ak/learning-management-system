import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getStudentCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const StudentCourseProgress = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);

  const params = useParams();
  const id = params.id;

  const [lockedCourse, setLockedCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const markedLectureRef = useRef(null);
  const userId = auth?.user?._id;

  const loadCurrentCourseProgress = useCallback(async () => {
    if (!userId || !id) return;

    setProgressLoading(true);
    try {
      const response = await getStudentCurrentCourseProgressService(userId, id);
      if (!response?.success) {
        throw new Error(response?.message || "Unable to load course progress.");
      }

      if (!response.isPurchased) {
        setLockedCourse(true);
        setCurrentLecture(null);
        return;
      }

      setLockedCourse(false);
      const courseDetails = response.courseDetails;
      const curriculum = courseDetails?.curriculum || [];
      const progress = response.progress || [];
      setStudentCurrentCourseProgress({ courseDetails, progress });

      if (response.isCompleted) {
        setCurrentLecture(curriculum[0] || null);
        setShowCourseCompleteDialog(true);
        setShowConfetti(true);
        return;
      }

      setShowCourseCompleteDialog(false);
      const viewedLectureIds = new Set(
        progress.filter((item) => item.viewed).map((item) => item.lectureId)
      );
      setCurrentLecture(
        curriculum.find((lecture) => !viewedLectureIds.has(lecture._id)) ||
          curriculum[0] ||
          null
      );
    } catch (error) {
      if (error?.response?.status === 404) {
        setStudentCurrentCourseProgress(null);
        setLockedCourse(true);
        toast.error("This course is no longer available.");
        navigate("/student-courses", { replace: true });
        return;
      }
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Unable to load course progress."
      );
    } finally {
      setProgressLoading(false);
    }
  }, [id, navigate, setStudentCurrentCourseProgress, userId]);

  useEffect(() => {
    loadCurrentCourseProgress();
  }, [loadCurrentCourseProgress]);

  const handleRewatchCourse = async () => {
    try {
      const response = await resetCourseProgressService(
        userId,
        studentCurrentCourseProgress?.courseDetails?._id
      );
      if (!response?.success) {
        throw new Error(response?.message || "Unable to reset course progress.");
      }
      markedLectureRef.current = null;
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      await loadCurrentCourseProgress();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Unable to reset course progress."
      );
    }
  };

  useEffect(() => {
    if (
      currentLecture?.progressValue >= 0.95 &&
      currentLecture?._id &&
      markedLectureRef.current !== currentLecture._id
    ) {
      markedLectureRef.current = currentLecture._id;
      const updateCourseProgress = async () => {
        try {
          const response = await markLectureAsViewedService(
            userId,
            studentCurrentCourseProgress?.courseDetails?._id,
            currentLecture._id
          );
          if (!response?.success) {
            throw new Error(response?.message || "Unable to save progress.");
          }
          await loadCurrentCourseProgress();
        } catch (error) {
          markedLectureRef.current = null;
          toast.error(
            error?.response?.data?.message ||
              error.message ||
              "Unable to save lecture progress."
          );
        }
      };
      updateCourseProgress();
    }
  }, [
    currentLecture,
    loadCurrentCourseProgress,
    studentCurrentCourseProgress?.courseDetails?._id,
    userId,
  ]);

  useEffect(() => {
    if (showConfetti) {
      const timeout = setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
      return () => clearTimeout(timeout);
    }
  }, [showConfetti]);


  if (
    progressLoading &&
    !lockedCourse &&
    !studentCurrentCourseProgress?.courseDetails
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1c1d1f] text-white">
        Loading course progress...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-r-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-black bg-white"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses page
          </Button>
          <h1 className="text-lg font-bold hidden md:block">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="z-50"
          aria-label={isSidebarOpen ? "Hide course sidebar" : "Show course sidebar"}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSidebarOpen ? "mr-[400px]" : ""
          } transition-all duration-300`}
        >
          <VideoPlayer
            width="100%"
            height="500px"
            url={currentLecture?.videoUrl}
            useProgressUpdate={true}
            onProgressUpdate={setCurrentLecture}
            progressData={currentLecture}
          />
          <div className="p-6 bg-[#1c1d1f]">
            <h2 className="text-3xl font-bold mb-3">{currentLecture?.title}</h2>
          </div>
        </div>
        <div
          className={`fixed top-[68px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-r-gray-700 transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex-col">
            <TabsList className="grid bg-white w-full grid-cols-2 p-0 h-14">
              <TabsTrigger
                value="content"
                className=" text-black bg-white rounded-none h-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className=" text-black bg-white rounded-none h-full"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum?.map(
                    (item) => (
                      <div
                        key={item?._id}
                        className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer"
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <button
                            type="button"
                            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                            aria-label={`Play ${item?.title || "lecture"}`}
                            onClick={() => setCurrentLecture(item)}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <span>{item?.title}</span>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog
        open={lockedCourse}
        onOpenChange={(open) => {
          if (!open) {
            setLockedCourse(false);
            navigate("/student-courses");
          }
        }}
      >
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can&apos;t access this course</DialogTitle>
            <DialogDescription>
              Please purchase the course to access it
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary">Back to My Courses</Button>
            </DialogClose>
            <Button onClick={() => navigate(`/course/details/${id}`)}>
              Purchase Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCourseCompleteDialog}>
        <DialogContent className="sm:w-[425px]" showOverlay={false}>
          <DialogHeader>
            <DialogTitle>Congratulations!!!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div>
                <Button
                  className="mr-5"
                  onClick={() => navigate("/student-courses")}
                >
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse}>
                  Rewatch the course
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentCourseProgress;
