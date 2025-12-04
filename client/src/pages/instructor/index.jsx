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
import { toast } from "react-toastify";

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
    toast.success("Logged out successfully" , {autoClose: 800});
    resetCredentials();
    sessionStorage.clear();
  };


  return (
    <div className="flex h-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <aside className="w-64 bg-white shadow-xl hidden md:block border-r-2 border-indigo-100">
        <div className="p-6">
          <div className="mb-8 pb-6 border-b-2 border-indigo-100">
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
                onClick={
                  menuItem.value === "logout"
                    ? handleLogOut
                    : () => setActiveTab(menuItem.value)
                }
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
              >
                <menuItem.icon className="mr-3 h-5 w-5" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 rounded-2xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
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
  );
};

export default InstructorDashboardPage;
