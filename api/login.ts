import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { IDENTITY_BASE_URL } from "./baseURL/identityBaseURL";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const url = `${IDENTITY_BASE_URL}/user/login/`;
    console.log("POST:", url);

    const response = await axios.post(url, credentials, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // --- 1. EXTRACT TOKEN CORRECTLY ---
    const accessToken = response.data?.access_token;
    console.log(accessToken);

    const refreshToken = response.data?.refresh_token;

    // --- 2. SAVE TO SECURE STORE ---
    if (accessToken) {
      console.log("✅ Token found! Saving to SecureStore...");
      await SecureStore.setItemAsync("userToken", accessToken);

      // Optional: Save refresh token if you need it later
      if (refreshToken) {
        await SecureStore.setItemAsync("refreshToken", refreshToken);
      }
    } else {
      console.error("❌ CRITICAL: 'access_token' missing in response!");
    }

    return {
      success: true,
      message: "Login successful",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Login API Error:", error);

    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      return {
        success: false,
        message: errorData.message || errorData.detail || "Invalid credentials",
      };
    } else {
      return {
        success: false,
        message: "An unexpected error occurred.",
      };
    }
  }
};
