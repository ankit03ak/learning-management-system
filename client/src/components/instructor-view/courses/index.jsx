import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";

import { InstructorContext } from "@/context/instructor-context";
import { Delete, Edit } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const InstructorCourses = ({ listOfCourses }) => {
  const navigate = useNavigate();

  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

    

  return (
    <div>
      <Card className="border-2 border-indigo-100 rounded-2xl shadow-xl bg-white">
        <CardHeader className="flex justify-between flex-row items-center border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            All Courses
          </CardTitle>
          <Button
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={() => {
              setCurrentEditedCourseId(null);
              setCourseCurriculumFormData(courseCurriculumInitialFormData);
              setCourseLandingFormData(courseLandingInitialFormData);
              navigate("/instructor/create-new-course");
            }}
          >
            Create A New Course
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-indigo-100 hover:bg-indigo-50/50">
                  <TableHead className="font-bold text-gray-700 text-base py-4">Course</TableHead>
                  <TableHead className="font-bold text-gray-700 text-base py-4">Students</TableHead>
                  <TableHead className="font-bold text-gray-700 text-base py-4">Revenue</TableHead>
                  <TableHead className="text-right font-bold text-gray-700 text-base py-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listOfCourses && listOfCourses.length > 0
                  ? listOfCourses.map((course) => (
                      <TableRow 
                        key={course._id}
                        className="border-b border-indigo-50 hover:bg-indigo-50/50 transition-colors duration-200"
                      >
                        <TableCell className="font-semibold text-gray-800 py-4">
                          {course?.title}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                            {course?.students?.length}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Rs {course?.students?.length * course?.pricing}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-all duration-200"
                              onClick={() => {
                                navigate(
                                  `/instructor/edit-course/${course?._id}`
                                );
                              }}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200"
                            >
                              <Delete className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorCourses;
