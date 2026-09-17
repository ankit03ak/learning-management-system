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
      <header className="flex items-center justify-between px-4 py-3 lg:px-10 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity group">
              <img
                src="/logo.png"
                alt="LMS Logo"
                className="h-12 w-14 object-contain"
              />
          </Link>
          <div className="hidden items-center space-x-1 sm:flex">
            <Button
              variant="ghost"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all duration-300"
              onClick={() => navigate("/courses")}
            >
              Explore Courses
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 md:gap-3 items-center">
            <div
              className="flex gap-2 md:gap-3 items-center cursor-pointer group hover:opacity-80 transition-all duration-300"
              onClick={() => navigate("/student-courses")}
            >
              <span className="font-semibold text-sm text-slate-600 group-hover:text-indigo-700 transition-colors bg-slate-100 hover:bg-indigo-50 rounded-full px-3 py-2">
                My Courses
              </span>
          
            </div>
            <Button 
              onClick={handleLogOut}
              className="bg-slate-900 hover:bg-indigo-700 text-white font-semibold px-4 md:px-5 py-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
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
