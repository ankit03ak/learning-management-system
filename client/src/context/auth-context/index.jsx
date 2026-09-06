import { initalSignInFormData, initalSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => emailRegex.test(email);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initalSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initalSignUpFormData);
  const [auth, setAuth] = useState({ authenticated: false, user: null });
  const [loading, setLoading] = useState(true);

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
  try {
    const data = await registerService(signUpFormData);

    if (data.success) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem(
    "user",
    JSON.stringify(data.user || data.newUser)
  );

  toast.success("Registration successful!");

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
    setSignUpFormData(initalSignUpFormData);
  }
};

  const handleloginUser = async (event) => {
  event.preventDefault();
  setLoading(true);

  const { userEmail, userPassword } = signInFormData;

  if (!userEmail || !userPassword) {
    toast.error("Email and password are required");
    setLoading(false);
    return;
  }

  if (!isValidEmail(userEmail)) {
    toast.error("Please enter a valid email address");
    setLoading(false);
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
      toast.success("Login successful!");
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
    setLoading(false);
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
      setAuth({ authenticated: false, user: null });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        if (isMounted) {
          await checkAuthUser();
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser || typeof parsedUser !== "object") {
          throw new Error("Invalid stored user");
        }

        if (isMounted) {
          setAuth({ authenticated: true, user: parsedUser });
          // Verify the cached session instead of trusting stale browser data.
          await checkAuthUser();
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (isMounted) {
          setAuth({ authenticated: false, user: null });
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

const resetCredentials = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  sessionStorage.removeItem("accessToken");
  setAuth({ authenticated: false, user: null });
};


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
      }}
    >
      {loading ? (
        <div className=" fixed inset-0 spinner-container flex flex-col items-center justify-center  ">
          <ClipLoader color="#36D7B7" size={70} />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
