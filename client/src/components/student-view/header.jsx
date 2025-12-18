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
              <img
                src="/logo.png"
                alt="LMS Logo"
                className="w-18 h-16"
              />
          </Link>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className="text-[14px] md:text-[16px] font-medium text-blue-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
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
              <span className="font-bold md:text-lg text-sm text-blue-500 group-hover:text-indigo-600 transition-colors mr-8 bg-slate-200 hover:bg-slate-300 border-collapse rounded-full px-3 py-1">
                My Courses
              </span>
          
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
