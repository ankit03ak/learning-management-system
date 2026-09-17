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
    <div className="min-h-screen">
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            Learn at your own pace
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
            Learning that gives you wisdom
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">Build practical skills with focused courses, clear lessons, and a learning experience designed around your goals.</p>
          <Button onClick={() => navigate("/courses")} className="rounded-xl bg-slate-900 px-6 py-6 text-base font-semibold shadow-lg hover:bg-indigo-700">
            Explore all courses
          </Button>
        </div>
        <div className="relative lg:pl-8">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-2xl" />
          <LazyLoadImage
            src={image01}
            alt=""
            width={600}
            height={400}
            className="relative w-full h-auto rounded-[2rem] shadow-2xl border border-white object-cover"
          />
        </div>
      </section>
      
      <section className="border-y border-slate-200/80 bg-white/70 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">
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
        </div></div>
      </section>
      
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="text-3xl font-bold mb-6 text-slate-900">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => {
                  handleCourseNavigate(courseItem?._id);
                }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl cursor-pointer transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <LazyLoadImage
                    src={courseItem.image}
                    width={300}
                    height={150}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    effect="blur"
                    threshold={100}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-105 transition-opacity duration-300"></div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
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
