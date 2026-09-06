import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_BASE_URL?.trim();
const baseURL =
  configuredBaseUrl ||
  (import.meta.env.DEV ? "http://localhost:8080" : window.location.origin);

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    console.error("Interceptor request error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
