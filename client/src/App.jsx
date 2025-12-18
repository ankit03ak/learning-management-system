import { Route, Routes } from "react-router-dom";
import { useContext, lazy, Suspense } from "react";
import { AuthContext } from "./context/auth-context";
import RouteGuard from "./components/route-guard";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import NotFoundPage from "./pages/not-found page";

import { ClipLoader } from "react-spinners";
import StudentHomePage from "./pages/student/home";
import { ToastContainer } from "react-toastify";

const AuthPage = lazy(() => import("./pages/auth"));
const InstructorDashboardPage = lazy(() => import("./pages/instructor"));
const AddNewCoursePage = lazy(() =>
  import("./pages/instructor/add-new-course")
);
const StudentViewCoursesPage = lazy(() => import("./pages/student/courses"));
const StudentViewCourseDetailsPage = lazy(() =>
  import("./pages/student/course-details")
);
const PaypalPaymentReturnPage = lazy(() =>
  import("./pages/student/payment-return")
);
const StudentCoursesPage = lazy(() =>
  import("./pages/student/student-courses")
);
const StudentCourseProgress = lazy(() =>
  import("./pages/student/course-progress")
);

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <Suspense
      fallback={
        <div className=" fixed inset-0 spinner-container flex items-center justify-center  ">
          <ClipLoader color="#36D7B7" size={70} />
        </div>
      }
    >
      <ToastContainer/>
      <Routes>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardPage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/create-new-course"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={auth?.authenticated}
              user={auth?.user}
            />
          }
        >
          <Route index element={<StudentHomePage />} />
          <Route path="/courses" element={<StudentViewCoursesPage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="/payment-return" element={<PaypalPaymentReturnPage />} />
          <Route path="/student-courses" element={<StudentCoursesPage />} />
          <Route
            path="/course-progress/:id"
            element={<StudentCourseProgress />}
          />
          <Route
            path="/course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
