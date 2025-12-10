import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, IndianRupee, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

const InstructorDashboard = ({ listOfCourses }) => {
  const calculateTotalStudentsAndRevenue = () => {
    const { totalStudents, totalRevenue, studentList } = listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students.length;
        acc.totalStudents += studentCount;
        acc.totalRevenue += course.pricing * studentCount;

        course.students.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
          });
        });
        return acc;
      },
      {
        totalStudents: 0,
        totalRevenue: 0,
        studentList: [],
      }
    );
    return {
      totalStudents,
      totalRevenue,
      studentList,
    };
  };

  const [config, setConfig] = useState([
    {
      icon: Users,
      label: "Total Students",
      value: 10,
    },
    {
      icon: IndianRupee,
      label: "Total Revenue",
      value: 100,
    },
  ]);

  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    const result = calculateTotalStudentsAndRevenue();
  

    setConfig([
      {
        icon: Users,
        label: "Total Students",
        value: result.totalStudents,
      },
      {
        icon: IndianRupee,
        label: "Total Revenue",
        value: result.totalRevenue,
      },
    ]);

    setStudentList(result.studentList);
  }, [listOfCourses]);



  // if (listOfCourses.length === 0) {
  //   return <Skeleton />;
  // }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.map((item, index) => (
          <Card 
            key={index}
            className="border-2 border-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-300">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {item.label}
              </CardTitle>
              <div className="p-2 rounded-lg shadow-md">
                <item.icon className="h-5 w-5 text-black" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-indigo-100 rounded-2xl shadow-xl bg-white">
        <CardHeader className="border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b-2 border-indigo-100 hover:bg-indigo-50/50">
                  <TableHead className="font-bold text-gray-700 text-base">Course Name</TableHead>
                  <TableHead className="font-bold text-gray-700 text-base">Student Name</TableHead>
                  <TableHead className="font-bold text-gray-700 text-base">Student Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentList.map((studentItem, index) => (
                  <TableRow 
                    key={index}
                    className="border-b border-indigo-50 hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <TableCell className="font-semibold text-gray-800 py-4">
                      {studentItem?.courseTitle}
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">
                      {studentItem?.studentName}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {studentItem?.studentEmail}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
