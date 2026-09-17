import { initalSignInFormData, initalSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";
import { HashLoader } from "react-spinners";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AuthContext = createContext(null);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => emailRegex.test(email);

export default function AuthProvider({ children }) {
  
  const [signInFormData, setSignInFormData] = useState(initalSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initalSignUpFormData);
  const [auth, setAuth] = useState({ authenticated: false, user: null });
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleRegisterUser = async (event) => {
  event.preventDefault();
  
  const { userName, userEmail, userPassword, role } = signUpFormData;
  
  if (!userName || !userEmail || !userPassword || !role) {
    toast.error("All fields are required");
    return;
  }
  
  if (!isValidEmail(userEmail)) {
    toast.error("Please enter a valid email address");
    return;
  }
  
  if (userPassword.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }
  setLoginLoading(true);
  try {
    const data = await registerService(signUpFormData);

    if (data.success) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem(
    "user",
    JSON.stringify(data.user || data.newUser)
  );

  toast.success("Registration successful!", { autoClose: 800 });

  setAuth({
    authenticated: true,
    user: data.user || data.newUser,
  });
} else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log("Error in registering user", error);
    toast.error(error?.response?.data?.message || "Registration failed");
  } finally {
    setLoginLoading(false);
    setSignUpFormData(initalSignUpFormData);
  }
};

  const handleloginUser = async (event) => {
  event.preventDefault();
  setLoginLoading(true);

  const { userEmail, userPassword } = signInFormData;

  if (!userEmail || !userPassword) {
    toast.error("Email and password are required");
    setLoginLoading(false);
    return;
  }

  if (!isValidEmail(userEmail)) {
    toast.error("Please enter a valid email address");
    setLoginLoading(false);
    return;
  }

  try {
    const data = await loginService(signInFormData);
    if (data.success) {
      // sessionStorage.setItem(
      //   "accessToken",
      //   JSON.stringify(data.accessToken)
      // );
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user || data.newUser));
      toast.success("Login successful!", { autoClose: 1300 });
      setAuth({
        authenticated: true,
        user: data.user || data.newUser,
      });
    } else {
      toast.error(data.message || "Login failed");
      setAuth({
        authenticated: false,
        user: null,
      });
    }
  } catch (error) {
    console.log("Error logging in the user", error);
    toast.error(error?.response?.data?.message || "Login failed");
  } finally {
    setLoginLoading(false);
    setSignInFormData(initalSignInFormData);
  }
};


  const checkAuthUser = async () => {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticated: true,
          user: data.user,
        });
        setLoading(false);
      } else {
        setAuth({
          authenticated: false,
          user: null,
        });
        setLoading(false);
      }
    } catch (error) {
      console.log("Authentication check error", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.status &&
        error.response.data.status === 401
      ) {
        setAuth({
          authenticated: false,
          user: null,
        });
      }
      setLoading(false);
    }
  };

useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  if (token && user) {
    setAuth({
      authenticated: true,
      user: JSON.parse(user),
    });
    setLoading(false);
  } else {
    checkAuthUser();
  }
}, []);

const resetCredentials = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  setAuth({ authenticated: false, user: null });
};

const LOADING_MESSAGES = [
  "Waking up the server...",
  "This can take up to a 40 seconds on first load",
  "Almost there, hang tight...",
];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleloginUser,
        auth,
        resetCredentials,
        loading,
        loginLoading,
      }}
    >
      {loading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-6 px-6">
      <img src="/logo.png" alt="LearnSphere" className="h-24 w-auto" />

      <HashLoader color="#36D7B7" size={80} />

      <div className="text-center max-w-sm">
        <p className="text-gray-700 font-medium transition-opacity duration-500">
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          First load may take a little longer — subsequent visits will be instant.
        </p>
      </div>
    </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
