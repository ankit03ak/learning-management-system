import axiosInstance from "@/api/axiosInstance";

export const registerService = async (formData) => {
  const res = await axiosInstance.post("/auth/register", {
    ...formData
  });
  return res.data;
};

export const loginService = async (formData) => {
  const res = await axiosInstance.post("/auth/login", formData);
  return res.data;
};

export const checkAuthService = async () => {
  const res = await axiosInstance.get("/auth/check-auth");
  return res.data;
};

export const mediaUploadService = async (formData, onProgressCallBack) => {
  const res = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallBack(percentCompleted);
    },
  });  
  return res.data;
};

export const mediaDeleteService = async (id) => {
  const res = await axiosInstance.delete(`/media/delete/${id}`);
  return res.data;
};

export const fetchInstructorCourseListService = async (instructorId) => {
  const res = await axiosInstance.get(`/instructor/course/get/${instructorId}`);
  return res.data;
};

export const addNewCourseService = async (formData) => {
  const res = await axiosInstance.post("/instructor/course/add", formData);
  return res.data;
};

export const fetchInstructorCourseDetailsService = async (id) => {
  const res = await axiosInstance.get(`/instructor/course/get/details/${id}`);
  return res.data;
};

export const updateCourseByIdService = async (id, formData) => {
  const res = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );
  return res.data;
};

export const mediaBulkUploadService = async (formData, onProgressCallBack) => {
  const res = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallBack(percentCompleted);
    },
  });

  return res.data;
};

export const fetchStudentViewCourseListService = async (query) => {
  const res = await axiosInstance.get(`/student/course/get?${query}`);
  return res.data;
};

export const fetchStudentViewCourseDetailsService = async (courseId) => {
  const res = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );
  return res.data;
};

export const createPaymentService = async (formData) => {
  const res = await axiosInstance.post(`/student/order/create`, formData);
  return res.data;
};

export const captureAndFinalizePaymentService = async (formData) => {
  const res = await axiosInstance.post(`/student/order/capture`, formData);
  return res.data;
};

export const fetchStudentBoughtCoursesService = async (studentId) => {
  const res = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );
  return res.data;
};

export const checkCoursePurchaseInfoService = async (courseId, studentId) => {
  const res = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );
  return res.data;
};

export const getStudentCurrentCourseProgressService = async (
  userId,
  courseId
) => {
  const res = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );
  return res.data;
};

export const markLectureAsViewedService = async (userId, courseId, lectureId) => {
  const res = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`, {
      userId, courseId, lectureId
    }
  ); 
  return res.data;
};

export const resetCourseProgressService = async (userId, courseId) => {
  const res = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );
  return res.data;
};
