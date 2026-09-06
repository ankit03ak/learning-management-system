import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import {
  addNewCourseService,
  fetchInstructorCourseDetailsService,
  updateCourseByIdService,
} from "@/services";
import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const AddNewCoursePage = () => {
  const navigate = useNavigate();

  const {
    courseLandingFormData,
    courseCurriculumFormData,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    currentEditedCourseId,
    setCurrentEditedCourseId,
  } = useContext(InstructorContext);

  const isEmpty = (value) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return (
      value === "" ||
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    );
  };

  const validateFormData = () => {
    const requiredLandingFields = [
      "title",
      "category",
      "level",
      "primaryLanguage",
      "description",
      "pricing",
    ];

    for (const key of requiredLandingFields) {
      if (isEmpty(courseLandingFormData[key])) {
        return false;
      }
    }

    const textLimits = {
      title: 200,
      subtitle: 300,
      description: 10000,
      objectives: 5000,
      welcomeMessage: 5000,
    };
    for (const [key, limit] of Object.entries(textLimits)) {
      if (String(courseLandingFormData[key]).trim().length > limit) {
        return false;
      }
    }

    const pricing = Number(courseLandingFormData.pricing);
    if (!Number.isFinite(pricing) || pricing < 0 || pricing > 1000000) {
      return false;
    }

    for (const item of courseCurriculumFormData) {
      if (
        !item ||
        isEmpty(item.title) ||
        isEmpty(item.videoUrl) ||
        String(item.title).trim().length > 200 ||
        String(item.videoUrl).trim().length > 2048
      ) {

        return false;
      }
    }

    return courseCurriculumFormData.length > 0;
  };

  const { auth } = useContext(AuthContext);

  const handleCreateCourse = async () => {
    const courseFinalFormData = {
      instructorId: auth?.user?._id,
      instructorName: auth?.user?.userName,
      date: new Date(),
      ...courseLandingFormData,
      students: [],
      curriculum: courseCurriculumFormData,
      isPublished: true,
    };

    const updateData = {
      ...courseLandingFormData,
      curriculum: courseCurriculumFormData
    }

    try {
      const result =
        currentEditedCourseId !== null
          ? await updateCourseByIdService(currentEditedCourseId, updateData)
          : await addNewCourseService(courseFinalFormData);

      if (result?.success) {
        setCourseLandingFormData(courseLandingInitialFormData);
        setCourseCurriculumFormData(courseCurriculumInitialFormData);
        setCurrentEditedCourseId(null);
        navigate(-1);
      } else {
        toast.error(result?.message || "Unable to save course.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save course.");
    }
  };

  const params = useParams();

  useEffect(() => {
    if (params?.courseId) {
      setCurrentEditedCourseId(params?.courseId);
    }
  }, [params?.courseId, setCurrentEditedCourseId]);

  useEffect(() => {
    let isMounted = true;

    if (currentEditedCourseId !== null) {
      const fetchCourseDetails = async () => {
        try {
          const response = await fetchInstructorCourseDetailsService(
            currentEditedCourseId
          );

          if (response?.success && isMounted) {
            const setCourseFormData = Object.keys(courseLandingInitialFormData).reduce(
              (acc, key) => {
                acc[key] =
                  response?.courseDetails[key] ||
                  courseLandingInitialFormData[key];
                return acc;
              },
              {}
            );

            setCourseLandingFormData(setCourseFormData);
            setCourseCurriculumFormData(response?.courseDetails?.curriculum || []);
          }
        } catch (error) {
          if (isMounted) {
            toast.error(
              error?.response?.data?.message || "Unable to load course."
            );
          }
        }
      };
      fetchCourseDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [
    currentEditedCourseId,
    setCourseCurriculumFormData,
    setCourseLandingFormData,
  ]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-5">Create a new course</h1>
        <Button
          disabled={!validateFormData()}
          className="text-sm tracking-wider font-bold px-8"
          onClick={handleCreateCourse}
        >
          Submit
        </Button>
      </div>
      <Card>
        <CardContent>
          <div className="container mx-auto p-4">
            <Tabs className="space-y-4" defaultValue="curriculum">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum">
                <CourseCurriculum />
              </TabsContent>
              <TabsContent value="course-landing-page">
                <CourseLanding />
              </TabsContent>
              <TabsContent value="settings">
                <CourseSettings />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewCoursePage;
