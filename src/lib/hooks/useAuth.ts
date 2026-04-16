// src/lib/hooks/useAuth.ts

// src/lib/hooks/useAuth.ts
"use client";
import axiosInstance from "../instance/axios-instance";
import { AxiosError } from "axios";
import { useState } from "react";
import {
  forgotPassword,
  resendForgotOtp,
  resetPassword,
  verifyOtp,
} from "../services/authService";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    const res = await forgotPassword(email);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.message || "Something went wrong");
    }

    setLoading(false);
    return res;
  };

  // Handle OTP verification
  const handleVerifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);

    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token") || "";

    if (!tokenFromURL) {
      setError("Invalid or missing token");
      setLoading(false);
      return { success: false, message: "No token found in URL" };
    }

    const res = await verifyOtp({ otp }, tokenFromURL);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.message || "Something went wrong");
    }

    setLoading(false);
    return res;
  };

  //  NEW — Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token") || "";

    if (!tokenFromURL) {
      setError("Invalid or missing token");
      setLoading(false);
      return { success: false, message: "No token found in URL" };
    }

    const res = await resendForgotOtp(tokenFromURL);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.message || "Something went wrong");
    }

    setLoading(false);
    return res;
  };

  // Reset Password hook
  const handleResetPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token") || "";

    if (!tokenFromURL) {
      setError("Invalid or missing token");
      setLoading(false);
      return { success: false, message: "No token found in URL" };
    }

    const res = await resetPassword(newPassword, tokenFromURL);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.message || "Something went wrong");
    }

    setLoading(false);
    return res;
  };

  return {
    loading,
    result,
    error,
    handleVerifyOtp,
    handleForgotPassword,
    handleResendOtp,
    handleResetPassword,
  };
}

// GET method /all-users

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axiosInstance.get("/user/all-users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res.data;
    },
  });
};

// PATCH method /update-user/:id/role

export const useUpdateUser = () => {
  return useMutation<
    { success: boolean; message?: string },
    AxiosError<{ message?: string }>,
    { id: string; data: { role: string } }
  >({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { role: string };
    }) => {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axiosInstance.patch(`/user/${id}/role`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res.data;
    },
  });
};

// DELETE method /user/:userId

export const useDeleteUser = () => {
  return useMutation<
    { success: boolean; message?: string },
    AxiosError<{ message?: string }>,
    string
  >({
    mutationFn: async (userId: string) => {
      const accessToken = localStorage.getItem("accessToken");
      const res = await axiosInstance.delete(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res.data;
    },
  });
};
