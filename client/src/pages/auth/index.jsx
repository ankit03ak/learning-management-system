import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context/index";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const AuthPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/");
  };

  const [activeTab, setActiveTab] = useState("signin");

  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleloginUser,
    loginLoading,
  } = useContext(AuthContext);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const checkIfSignInFormValid = () => {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.userPassword !== ""
    );
  };

  const checkIfSignUpFormValid = () => {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.userPassword !== "" &&
      signUpFormData.role !== ""
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Light Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50 flex-shrink-0">
        <div
          onClick={handleNavigate}
          className="flex items-center justify-center cursor-pointer group"
        >
          <img
            src="/logo.png"
            alt="LMS Logo"
            className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </header>

      {/* Main Container with Soft Radial Light Background */}
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-slate-50 to-slate-100 px-3 pt-4 sm:px-6 sm:pt-6">
        <div className="my-0 w-full max-w-md -translate-y-1 space-y-4 sm:-translate-y-2 sm:space-y-5">
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              LMS Learn
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Access your learning journey
            </p>
          </div>

          <Tabs
            value={activeTab}
            defaultValue="signin"
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* Styled Light Pill Tabs */}
            <TabsList className="mb-4 grid h-11 w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-200/60 p-1">
              <TabsTrigger
                value="signin"
                className="h-full rounded-lg px-4 text-sm font-semibold text-slate-600 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="h-full rounded-lg px-4 text-sm font-semibold text-slate-600 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="signin"
              className="transition-all duration-300 ease-in-out focus-visible:outline-none"
            >
              <Card className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-8">
                <CardHeader className="space-y-3 p-0">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm">
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                  <CommonForm
                    formControls={signInFormControls}
                    buttonText={loginLoading ? "Signing in..." : "Sign In"}
                    formData={signInFormData}
                    setFormData={setSignInFormData}
                    isButtonDisabled={loginLoading || !checkIfSignInFormValid()}
                    handleSubmit={handleloginUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="signup"
              className="transition-all duration-300 ease-in-out focus-visible:outline-none"
            >
              <Card className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-7">
                <CardHeader className="space-y-1.5 p-0">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Create account
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm">
                    Enter your details to get started with LMS Learn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                  <CommonForm
                    formControls={signUpFormControls}
                    buttonText={loginLoading ? "Creating account..." : "Sign Up"}
                    formData={signUpFormData}
                    setFormData={setSignUpFormData}
                    isButtonDisabled={loginLoading || !checkIfSignUpFormValid()}
                    handleSubmit={handleRegisterUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} LMS Learn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;