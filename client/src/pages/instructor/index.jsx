import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { TabsContent } from "@radix-ui/react-tabs";
import { BarChart, Book, LogOut } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "@/components/theme-toggle";

const InstructorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { resetCredentials } = useContext(AuthContext);

  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

    const {auth} = useContext(AuthContext)
  
    const instructorId = auth?.user?._id

  useEffect(() => {
    const fetchAllCourses = async () => {
      
      const response = await fetchInstructorCourseListService(instructorId);

      if (response?.success) {
        setInstructorCoursesList(response.courseList);
      }
    };

    fetchAllCourses();
  }, []);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  const handleLogOut = () => {
    toast.success("Logged out successfully" , {autoClose: 1300});
    resetCredentials();
    sessionStorage.clear();
  };

  const handleMenuAction = (value) => {
    if (value === "logout") {
      handleLogOut();
      return;
    }

    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-1 border-b border-indigo-100 bg-white/95 px-2 shadow-sm backdrop-blur md:hidden">
        <nav aria-label="Instructor navigation" className="flex min-w-0 flex-1 items-center gap-1">
          {menuItems.map((menuItem) => (
            <Button
              key={menuItem.value}
              type="button"
              variant="ghost"
              onClick={() => handleMenuAction(menuItem.value)}
              className={`h-10 min-w-0 flex-1 gap-1 rounded-lg px-2 text-xs font-semibold sm:text-sm ${
                activeTab === menuItem.value
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <menuItem.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{menuItem.label}</span>
            </Button>
          ))}
        </nav>
        <ThemeToggle className="h-10 w-10 shrink-0" />
      </header>

      <div className="flex min-h-screen pt-16 md:pt-0">
        <aside className="sticky top-0 h-screen w-64 flex-shrink-0 self-start bg-white shadow-xl hidden md:block border-r-2 border-indigo-100">
        <div className="p-6">
          <div className="mb-8 pb-6 border-b-2 border-indigo-100">
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity group mb-4 ">
                  <img
                    src="/logo.png"
                    alt="LMS Logo"
                    className="w-20 h-auto object-contain ml-14"
                  />
            </Link>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Instructor View
            </h2>
          </div>
          <nav className="space-y-2">
            {menuItems.map((menuItem) => (
              <Button
                className={`w-full justify-start mb-2 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === menuItem.value
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                key={menuItem.value}
                onClick={() => handleMenuAction(menuItem.value)}
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
              >
                <menuItem.icon className="mr-3 h-5 w-5" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
        </aside>
        <main className="min-w-0 flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 rounded-2xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {activeTab === "courses" ? "Courses" : "Dashboard"}
            </h1>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent value={menuItem.value} key={menuItem.value}>
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
