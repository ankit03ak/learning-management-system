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
import { GraduationCap } from "lucide-react";
import React, { useState } from "react";
import { useContext } from "react";
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-indigo-100 bg-white/80 backdrop-blur-sm z-50 flex-shrink-0">
        <div
          onClick={handleNavigate}
          className="flex items-center justify-center cursor-pointer group"
        >
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl ml-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            LMS Learn
          </span>
        </div>
      </header>
      <div className="flex items-center justify-center flex-1 p-4 overflow-auto">
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2 p-1.5 bg-white rounded-2xl shadow-lg mb-6 border border-indigo-100 h-auto">
            <TabsTrigger 
              value="signin"
              className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold transition-all duration-300"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold transition-all duration-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="signin"
            className="transition-all duration-300 ease-in-out"
          >
            <Card className="p-8 space-y-4 bg-white rounded-2xl shadow-xl border border-indigo-100">
              <CardHeader className="space-y-2 p-0 pb-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-0">
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={"Sign In"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormValid()}
                  handleSubmit={handleloginUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value="signup"
            className="transition-all duration-300 ease-in-out"
          >
            <Card className="p-8 space-y-4 bg-white rounded-2xl shadow-xl border border-indigo-100">
              <CardHeader className="space-y-2 p-0 pb-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create account
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Enter your details to get started with LMS Learn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-0">
                <CommonForm
                  formControls={signUpFormControls}
                  buttonText={"Sign Up"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  isButtonDisabled={!checkIfSignUpFormValid()}
                  handleSubmit={handleRegisterUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
