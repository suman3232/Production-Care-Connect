import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.user);

  if (localStorage.getItem("token")) {
    if (user?.isAdmin) return <Navigate to="/admin/dashboard" />;
    if (user?.isDoctor) return <Navigate to="/doctor/dashboard" />;
    return <Navigate to="/home" />;
  }

  return children;
};

export default PublicRoute;
