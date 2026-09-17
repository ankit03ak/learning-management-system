import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 text-center">
      <div className="space-y-8">
        <div className="w-32 h-32 mx-auto">
          <img
            src="/logo.png"
            alt="LMS Logo"
            className="w-24 h-auto object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-600">
          Page Not Found
        </h2>
        <p className="text-muted-foreground max-w-xl">
          Oops! The page you're looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={goHome}
          className="mt-6 hover:scale-[1.02] transition-transform duration-200"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;