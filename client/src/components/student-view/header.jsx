import { GraduationCap, TvMinimalPlay } from "lucide-react";
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/auth-context";
import { toast } from "react-toastify";

const StudentViewCommonHeader = () => {
  const navigate = useNavigate();

  const { resetCredentials } = useContext(AuthContext);

  const handleLogOut = () => {
    toast.success("Logged out successfully" , {autoClose: 800});
    resetCredentials();
    sessionStorage.clear();
  };

  return (
    <div>
      <header className="flex items-center justify-between p-4 lg:px-8 border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity group">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="font-bold md:text-2xl text-lg ml-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LMS Learn
            </span>
          </Link>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className="text-[14px] md:text-[16px] font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
              onClick={() => navigate("/courses")}
            >
              Explore Courses
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex gap-3 md:gap-4 items-center">
            <div
              className="flex gap-2 md:gap-3 items-center cursor-pointer group hover:opacity-80 transition-all duration-300"
              onClick={() => navigate("/student-courses")}
            >
              <span className="font-bold md:text-lg text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                My Courses
              </span>
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-lg group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                <TvMinimalPlay className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <Button 
              onClick={handleLogOut}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-4 md:px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default StudentViewCommonHeader;
