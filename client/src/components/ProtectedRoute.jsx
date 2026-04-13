import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const getUser = async () => {
    try {
      dispatch(showLoading());
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/v1/user/getUserData",
        { token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(hideLoading());
      if (res.data.success) {
        dispatch(setUser(res.data.data));
      } else {
        localStorage.clear();
      }
    } catch (error) {
      dispatch(hideLoading());
      localStorage.clear();
    }
  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
    // eslint-disable-next-line
  }, [user]);

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  return children;
}
