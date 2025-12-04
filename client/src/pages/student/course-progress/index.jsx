import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import React, { useContext, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

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

  const handleRewatchCourse = async () => {
    
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);

      const fetchCurrentCourseProgress = async (req, res) => {
        const response = await getStudentCurrentCourseProgressService(
          auth?.user?._id,
          id
        );

        if (response?.success) {
          if (!response?.isPurchased) {
            setLockedCourse(true);
          } else {

            setStudentCurrentCourseProgress({
              courseDetails: response?.courseDetails,
              progress: response?.progress,
            });
          }

          if (response?.isCompleted) {
            setCurrentLecture(response?.courseDetails?.curriculum[0]);
            setShowCourseCompleteDialog(true);
            setShowConfetti(true);
            return;
          }

          if (response?.progress?.length === 0) {
            setCurrentLecture(response?.courseDetails?.curriculum[0]);
          } else {
            const lastIndexOfViewed = response?.progress?.reduceRight(
              (acc, obj, index) => {
                return acc === -1 && obj.viewed ? index : acc;
              },
              -1
            );
            setCurrentLecture(
              response?.courseDetails?.curriculum[lastIndexOfViewed + 1]
            );
          }
        }
      };

      fetchCurrentCourseProgress();
    }
  };

  useEffect(() => {
    const fetchCurrentCourseProgress = async (req, res) => {
      const response = await getStudentCurrentCourseProgressService(
        auth?.user?._id,
        id
      );

      if (response?.success) {
        if (!response?.isPurchased) {
          setLockedCourse(true);
        } else {

          setStudentCurrentCourseProgress({
            courseDetails: response?.courseDetails,
            progress: response?.progress,
          });
        }

        if (response?.isCompleted) {
          setCurrentLecture(response?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          return;
        }

        if (response?.progress?.length === 0) {
          setCurrentLecture(response?.courseDetails?.curriculum[0]);
        } else {
          const lastIndexOfViewed = response?.progress?.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );
          setCurrentLecture(
            response?.courseDetails?.curriculum[lastIndexOfViewed + 1]
          );
        }
      }
    };
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) {
      const updateCourseProgress = async () => {

        if (currentLecture) {

          const response = await markLectureAsViewedService(
            auth?.user?._id,
            studentCurrentCourseProgress?.courseDetails?._id,
            currentLecture?._id
          );


          if (response?.success) {

            const fetchCurrentCourseProgress = async (req, res) => {
              const response = await getStudentCurrentCourseProgressService(
                auth?.user?._id,
                id
              );

              if (response?.success) {
                if (!response?.isPurchased) {
                  setLockedCourse(true);
                } else {

                  setStudentCurrentCourseProgress({
                    courseDetails: response?.courseDetails,
                    progress: response?.progress,
                  });
                }

                if (response?.isCompleted) {

                  setCurrentLecture(response?.courseDetails?.curriculum[0]);
                  setShowCourseCompleteDialog(true);
                  setShowConfetti(true);
                  return;
                }

                if (response?.progress?.length === 0) {
                  setCurrentLecture(response?.courseDetails?.curriculum[0]);
                } else {
                  const lastIndexOfViewed =
                    response?.courseDetails?.curriculum?.findLastIndex(
                      (lecture) =>
                        response?.progress?.some(
                          (p) => p.lectureId === lecture._id && p.viewed
                        )
                    );

                  if (
                    lastIndexOfViewed + 1 <
                    response?.courseDetails?.curriculum.length
                  )
                    setCurrentLecture(
                      response?.courseDetails?.curriculum[lastIndexOfViewed + 1]
                    );
                }
              }
            };
            fetchCurrentCourseProgress();
          }
        }
      };

      updateCourseProgress();
    }
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
    }
  }, [showConfetti]);


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
                          <Play
                            className="h-4 w-4"
                            onClick={() => {
                              setCurrentLecture(item);
                            }}
                          />
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
      <Dialog open={lockedCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't access this course</DialogTitle>
            <DialogDescription>
              Please purchase the course to access it
            </DialogDescription>
          </DialogHeader>
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
