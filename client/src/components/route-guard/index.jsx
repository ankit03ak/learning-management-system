import React, { Fragment } from "react";
import { Navigate, useLocation } from "react-router-dom";

const RouteGuard = ({ authenticated, user, element }) => {
  const location = useLocation();

    
  if (!authenticated && !location.pathname.includes("/auth")) {
    return <Navigate to="/auth"></Navigate>;
  }

  if (
    authenticated &&
    user?.role !== "instructor" &&
    (location.pathname.includes("/instructor") ||
      location.pathname.includes("/auth"))
  ) {
    return <Navigate to="/home"></Navigate>;
  }

  if (
    authenticated &&
    user?.role === "instructor" &&
    !location.pathname.includes("/instructor")
  ) {
    return <Navigate to="/instructor"></Navigate>;
  }

  return <Fragment>{element}</Fragment>
};

export default RouteGuard;
