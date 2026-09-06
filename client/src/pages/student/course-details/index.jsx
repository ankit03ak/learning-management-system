import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const StudentViewCourseDetailsPage = () => {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);

  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const handleSetFreePreview = (getCurrentVideoInfo) => {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  };

  const handleCreatePayment = async () => {
   if (!auth?.user?._id || !studentViewCourseDetails?._id) {
     toast.error("Course information is unavailable. Please try again.");
     return;
   }
   setPaymentSubmitting(true);
   const paymentPayload = {
     userId: auth.user._id,
     userName: auth.user.userName,
     userEmail: auth.user.userEmail,
     orderStatus: "pending",
     paymentMethod: "paypal",
     paymentStatus: "initiated",
     orderDate: new Date(),
     paymentId: "",
     payerId: "",
     instructorId: studentViewCourseDetails.instructorId,
     instructorName: studentViewCourseDetails.instructorName,
     courseImage: studentViewCourseDetails.image,
     courseTitle: studentViewCourseDetails.title,
     courseId: studentViewCourseDetails._id,
     coursePricing: studentViewCourseDetails.pricing,
   };

   try {
     const response = await createPaymentService(paymentPayload);

    if (!response) {
      toast.error("No response from server. Please try again.");
      return;
    }

    if (response.success && response.result) {
      const { approveUrl, orderId } = response.result;

      if (typeof approveUrl === "string" && /^https?:\/\//i.test(approveUrl)) {
        if (orderId) sessionStorage.setItem("currentOrderId", orderId);

        window.location.href = approveUrl;
      } else {
        const msg = response.message || "Payment gateway URL was not returned.";
        toast.error(msg);
        console.error("Invalid PayPal approval URL:", response);
      }
    } else {
      const msg = response.message || "Failed to create payment.";
      toast.error(msg);
      console.error("Create payment failed:", response);
    }
  } catch (err) {
    console.error("Error creating payment:", err);
      toast.error(
        err?.response?.data?.message ||
          "Unable to start payment. Please try again."
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) {
      setShowFreePreviewDialog(true);
    }
  }, [displayCurrentVideoFreePreview]);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setCurrentCourseDetailsId(id);
    }
  }, [id, setCurrentCourseDetailsId]);

  const navigate = useNavigate();
  useEffect(() => {
    if (currentCourseDetailsId) {
      let isMounted = true;
      const fetchCourseDetails = async () => {
        try {
          const coursePurchaseInfoResponse =
            await checkCoursePurchaseInfoService(
              currentCourseDetailsId,
              auth?.user?._id
            );


          if (
            coursePurchaseInfoResponse?.success &&
            coursePurchaseInfoResponse?.boughtOrNot
          ) {
            navigate(`/course-progress/${currentCourseDetailsId}`);
            return;
          } else {
            setLoadingState(true);
            const response = await fetchStudentViewCourseDetailsService(
              currentCourseDetailsId
            );
            if (response?.success && isMounted) {
              setStudentViewCourseDetails(response?.courseDetails);
            } else if (isMounted) {
              setStudentViewCourseDetails(null);
            }
          }
        } catch (error) {
          console.log("Error fetching details of the course with id ", error);
          toast.error(
            "Error fetching details of the course. Please try again later."
          );
        } finally {
          setLoadingState(false);
        }
      };

      fetchCourseDetails();
      return () => {
        isMounted = false;
      };
    }
  }, [
    auth?.user?._id,
    currentCourseDetailsId,
    navigate,
    setLoadingState,
    setStudentViewCourseDetails,
  ]);

  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [
    location.pathname,
    setCurrentCourseDetailsId,
    setStudentViewCourseDetails,
  ]);

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  if (loadingState) {
    return <Skeleton />;
  }


  return (
    <div className="container mx-auto p-4">
      <div className=" bg-gray-900 text-white rounded-t-lg p-8">
        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span>Created by {studentViewCourseDetails?.instructorName}</span>
          <span>Created on           {studentViewCourseDetails?.date?.split("T")[0]}</span>
          <span>Level {studentViewCourseDetails?.level}</span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {studentViewCourseDetails?.primaryLanguage}
          </span>
          <span>
            {studentViewCourseDetails?.students?.length}{" "}
            {studentViewCourseDetails?.students?.length > 1
              ? "Students"
              : "Student"}
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you&apos;ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives
                  ?.split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <p className="text-xl mb-4"> */}
              {studentViewCourseDetails?.description}
              {/* </p> */}
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem, index) => (
                  <li
                    key={index}
                    className="flex items-center mb-4"
                  >
                    <button
                      type="button"
                      disabled={!curriculumItem?.freePreview}
                      className={`flex items-center ${
                        curriculumItem?.freePreview
                          ? "cursor-pointer hover:text-indigo-600"
                          : "cursor-not-allowed opacity-70"
                      }`}
                      onClick={() => handleSetFreePreview(curriculumItem)}
                    >
                      {curriculumItem?.freePreview ? (
                        <PlayCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      <span>{curriculumItem?.title}</span>
                    </button>
                  </li>
                )
              )}
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
                <VideoPlayer
                  url={
                    getIndexOfFreePreviewUrl !== -1
                      ? studentViewCourseDetails?.curriculum[
                          getIndexOfFreePreviewUrl
                        ].videoUrl
                      : ""
                  }
                  width="450px"
                  height="200px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  Rs {studentViewCourseDetails?.pricing}
                </span>
              </div>
              <Button 
  className="w-full" 
  disabled={paymentSubmitting} 
  onClick={handleCreatePayment}
>
  {paymentSubmitting ? (
    <ClipLoader size={18} />
  ) : (
    "Buy Now"
  )}
</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg flex items-center justify-center">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="450px"
              height="200px"
            />
          </div>
          <div className="flex flex-col gap-2">
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem) => (
                <button
                  type="button"
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="cursor-pointer text-left text-[16px] font-medium hover:text-indigo-600"
                  key={filteredItem._id || filteredItem.title}
                >
                  {filteredItem.title}
                </button>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentViewCourseDetailsPage;
