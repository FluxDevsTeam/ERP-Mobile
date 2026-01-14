import axios from "axios";
import { BASE_URL } from "./baseURL/identityBaseURL";

// --- API FUNCTIONS ---

/**
 * 1. Request OTP for Password Reset
 */
export const requestForgotPassword = async (email: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/forgot-password/request-forgot-password/`,
      { email }
    );
    return {
      success: true,
      message: response.data.message || "OTP sent successfully",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * 2. Resend OTP
 */
export const resendForgotPasswordOtp = async (email: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/forgot-password/resend-otp/`,
      { email }
    );
    return {
      success: true,
      message: response.data.message || "OTP resent successfully",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * 3. Verify OTP
 */
export const verifyForgotPasswordOtp = async (email: string, otp: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/forgot-password/verify-otp/`,
      {
        email,
        otp,
      }
    );
    return { success: true, message: response.data.message || "OTP verified" };
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * 4. Set New Password
 */
export const setNewPassword = async (
  email: string,
  new_password: string,
  confirm_password: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/forgot-password/set-new-password/`,
      {
        email,
        new_password,
        confirm_password,
      }
    );
    return {
      success: true,
      message: response.data.message || "Password reset successfully",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

// --- HELPER FOR ERROR HANDLING ---
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  let message = "An unexpected error occurred.";

  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    message = data.message || data.detail || message;
  } else if (error.request) {
    message = "Network error. Please check your connection.";
  }

  return { success: false, message };
};
