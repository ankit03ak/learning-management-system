import { Button } from "@/components/ui/button";
import { courseCategories } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { px } from "framer-motion";
//image from public folder
import image01 from "../../../assets/image01.png"

const StudentHomePage = () => {
  const navigate = useNavigate();
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const handleNavigateToCoursesPage = (courseCategoryId) => {
    sessionStorage.removeItem("filters");
    const currentFilters = {
      category: [courseCategoryId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilters));
    navigate("/courses");
  };

  const handleCourseNavigate = async (currentCourseId) => {

    const response = await checkCoursePurchaseInfoService(
      currentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.boughtOrNot) {
        navigate(`/course-progress/${currentCourseId}`);
      } else {
        navigate(`/course/details/${currentCourseId}`);
      }
    }
  };

  useEffect(() => {
    const fetchAllCoursesOfStudent = async () => {
      try {
        const response = await fetchStudentViewCourseListService();
        if (response?.success) {
          setStudentViewCoursesList(response?.courseList);
        }
      } catch (error) {
        console.log("Error fetching courses of the student", error);
        toast.error(
          error?.response?.data?.message ||
            "Error fetching courses. Please try again."
        );
      }
    };

    fetchAllCoursesOfStudent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 lg:py-10 px-4 lg:px-8 gap-8">
        <div className="lg:w-1/2 lg:pr-12 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Learning that gives you wisdom
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 font-medium">Get started with Us</p>
        </div>
        <div className="lg:w-full mb-8 lg:mb-0">
          <LazyLoadImage
            src={image01}
            alt=""
            width={600}
            height={400}
            className="w-full h-auto rounded-2xl shadow-2xl border border-indigo-100"
          />
        </div>
      </section>
      
      <section className="py-8 lg:py-10 px-4 lg:px-8 bg-white/60 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Course Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 lg:gap-4">
          {courseCategories.map((categoryItem) => (
            <Button
              className="justify-start h-auto py-3 px-5 rounded-xl font-semibold border-2 border-indigo-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
              variant="outline"
              key={categoryItem.id}
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
            >
              {categoryItem.label}
            </Button>
          ))}
        </div>
      </section>
      
      <section className="py-8 lg:py-10 px-4 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => {
                  handleCourseNavigate(courseItem?._id);
                }}
                className="group border-2 border-indigo-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 bg-white hover:border-indigo-300"
              >
                <div className="relative overflow-hidden">
                  <LazyLoadImage
                    src={courseItem.image}
                    width={300}
                    height={150}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    effect="blur"
                    threshold={100}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-105 transition-opacity duration-300"></div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {courseItem?.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {courseItem?.instructorName}
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <p className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Rs {courseItem?.pricing}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h1 className="text-2xl font-semibold text-gray-500">No Courses Found</h1>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentHomePage;
