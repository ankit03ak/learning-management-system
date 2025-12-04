import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ArrowUpDownIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

//This function and its useeffect shows how to chnage the URL according to key-value pairs of an object
const createSearchParamsHelper = (filterParams) => {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key} = ${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
};

const StudentViewCoursesPage = () => {
  const navigate = useNavigate();
  const [sort, setSort] = useState("price-lowtohigh");

  const [filters, setFilters] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

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

  //belwo one is mainly to update the url for  a better UX
  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    setSearchParams(new URLSearchParams(buildQueryStringForFilters));
  }, [filters]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      const fetchAllCoursesOfStudent = async () => {
        try {

          const query = new URLSearchParams({
            ...filters,
            sortBy: sort,
          });
          setLoadingState(true);
          const response = await fetchStudentViewCourseListService(query);
          if (response?.success) {
            setStudentViewCoursesList(response?.courseList);
          }
        } catch (error) {
          console.log("Error fetching courses of the student", error);
          toast.error(
            error?.response?.data?.message ||
              "Error fetching courses. Please try again."
          );
        } finally {
          setLoadingState(false);
        }
      };

      fetchAllCoursesOfStudent();
    }
  }, [filters, sort]);

  useEffect(() => {
    sessionStorage.removeItem("filters");
  }, []);

  //Below fucntion and "checked" and "onCheckedChange" tells how to control and synchronize marking and unmarking check-boxes
  const handleFilterOnChange = (getSectionId, getCurrentOption) => {
    let copyFilters = { ...filters };
    const indexOfCurrentSection =
      Object.keys(copyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      copyFilters = {
        ...copyFilters,
        [getSectionId]: [getCurrentOption.id],
      };
    } else {
      const indexOfCurrentOption = copyFilters[getSectionId].indexOf(
        getCurrentOption.id
      );

      if (indexOfCurrentOption === -1) {
        copyFilters[getSectionId].push(getCurrentOption.id);
      } else {
        copyFilters[getSectionId].splice(indexOfCurrentOption, 1);
      }
    }
    setFilters(copyFilters);
    sessionStorage.setItem("filters", JSON.stringify(copyFilters));
  };


  return (
    <div className="container mx-auto p-4 lg:p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        All Courses
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-72 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6 space-y-6 sticky top-4">
            {Object.keys(filterOptions).map((keyItem) => (
              <div className="space-y-2" key={keyItem?.Id}>
                <h3 className="font-bold text-lg text-gray-800 border-b-2 border-indigo-200 pb-2">
                  {keyItem.toUpperCase()}
                </h3>
                <div className="grid gap-3 mt-2">
                  {filterOptions[keyItem].map((option) => (
                    <Label 
                      className="flex font-medium items-center gap-3 cursor-pointer hover:text-indigo-600 transition-colors p-0 rounded-lg hover:bg-indigo-50" 
                      key={option?._id}
                    >
                      <Checkbox
                        checked={
                          filters &&
                          Object.keys(filters).length > 0 &&
                          filters[keyItem] &&
                          filters[keyItem].indexOf(option.id) > -1
                        }
                        onCheckedChange={() =>
                          handleFilterOnChange(keyItem, option)
                        }
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-600 data-[state=checked]:to-purple-600 data-[state=checked]:border-0"
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex justify-end items-center mb-6 gap-5 bg-white rounded-xl p-2 shadow-md border border-indigo-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-3 p-2 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all duration-300 font-semibold"
                >
                  <ArrowUpDownIcon className="h-3 w-3" />
                  <span className="text-[14px] font-medium">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] rounded-xl border-2 border-indigo-100">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                      className="cursor-pointer"
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {studentViewCoursesList.length} Results
            </span>
          </div>
          <div className="space-y-6">
            {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <Card
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  key={courseItem?._id}
                  className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-1 border-indigo-100 rounded-xl overflow-hidden hover:border-indigo-300 hover:scale-[1.02] bg-white"
                >
                  <CardContent className="flex gap-6 p-5">
                    <div className="w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                      <LazyLoadImage
                        src={courseItem?.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        effect="blur"
                        threshold={100}
                        width={192}
                        height={128}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {courseItem?.title}
                      </CardTitle>
                      <p className="text-medium text-gray-600">
                        By{" "}
                        <span className="font-bold text-gray-800">
                          {courseItem?.instructorName}
                        </span>
                      </p>
                      <p className="text-[15px] text-gray-600">
                        {`${courseItem?.curriculum?.length} ${
                          courseItem?.curriculum?.length > 1
                            ? `Lectures`
                            : `Lecture`
                        }`}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-[16px] font-semibold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                          {courseItem?.level.toUpperCase()}
                        </span>
                        <p className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Rs {courseItem?.pricing}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : loadingState ? (
              <Skeleton />
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-indigo-100">
                <h1 className="text-2xl font-semibold text-gray-500">No results found</h1>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentViewCoursesPage;
