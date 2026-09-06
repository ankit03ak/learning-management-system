import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import {Watch } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";


const StudentCoursesPage = () => {
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);

  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchStudentBoughtCourses = async () => {
      setLoading(true); 
      try {
        const response = await fetchStudentBoughtCoursesService(
          auth?.user?._id
        );

        if (response?.success) {
          setStudentBoughtCoursesList(response?.courses);
        } else {
          toast.error(response?.message || "Unable to load purchased courses.");
        }
      } catch (error) {
        console.error("Error fetching courses", error);
        toast.error(
          error?.response?.data?.message || "Unable to load purchased courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentBoughtCourses();
  }, [auth?.user?._id, setStudentBoughtCoursesList]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>

      {loading ? (
        <div className=" fixed inset-0 spinner-container flex items-center justify-center  ">
          <ClipLoader color="#36D7B7" size={70} />
        </div>
      ) : studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {studentBoughtCoursesList.map((course) => (
            <Card key={course._id} className="flex flex-col ">
              <CardContent className="p-4 flex-grow">
                <img
                  src={course?.courseImage}
                  alt={course?.title}
                  className="h-52 w-full object-cover rounded-md mb-4"
                />
                <h3 className="font-bold mb-1">{course?.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {course?.instructorName}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    navigate(`/course-progress/${course?.courseId}`)
                  }
                  className="flex-1"
                >
                  <Watch className="mr-2 h-4 w-4" />
                  Start Watching
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <h1 className="text-3xl font-bold">No courses purchased yet</h1>
      )}
    </div>
  );
};

export default StudentCoursesPage;
