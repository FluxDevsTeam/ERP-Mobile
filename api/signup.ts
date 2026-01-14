import axios from "axios";
import { BASE_URL } from "./baseURL/identityBaseURL";

export interface SignupRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  verify_password: string;
  username: string;
}

export interface SignupResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: any;
}

export const signupUser = async (
  userData: SignupRequest
): Promise<SignupResponse> => {
  try {
    const url = `${BASE_URL}/user/signup/`;
    console.log("POST:", url);

    const response = await axios.post(url, userData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // If we get here, the status is 2xx (Success)
    return {
      success: true,
      message: "Signup successful",
      data: response.data,
    };
  } catch (error: any) {
    // Axios throws an error if status is not 2xx
    console.error("Signup API Error:", error);

    if (axios.isAxiosError(error) && error.response) {
      // The server responded with a status code out of the range of 2xx
      const errorData = error.response.data;

      return {
        success: false,
        message: errorData.message || errorData.detail || "Signup failed",
        errors: errorData.errors || errorData,
      };
    } else if (error.request) {
      // The request was made but no response was received (Network Error)
      return {
        success: false,
        message: "Server unreachable. Please check your internet connection.",
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        message: "An unexpected error occurred.",
      };
    }
  }
};
