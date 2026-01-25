import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BILLING_BASE_URL } from './baseURL/billingBaseURL';

// --- TYPES ---
export interface PaymentInitiateRequest {
  plan_id: string;
  provider: string;
  auto_renew: boolean;
  callback_url?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  message?: string;
  data?: any; 
}

// App URL Scheme for deep linking
const APP_SCHEME = 'erpmobileapp';
const PAYMENT_CALLBACK_URL = `${APP_SCHEME}://payment-callback`;

// --- HELPER ---
const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`,
  };
};

// --- API CALL ---
export const initiatePayment = async (
  planId: string, 
  provider: 'paystack' | 'flutterwave' = 'paystack'
): Promise<PaymentInitiateResponse> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BILLING_BASE_URL}/payment/payment-initiate/`;

    const payload: PaymentInitiateRequest = {
      plan_id: planId,
      provider: provider,
      auto_renew: false,
      callback_url: `${PAYMENT_CALLBACK_URL}?status=success`,
    };

    console.log("------------------------------------------------");
    console.log("🔵 INITIATING PAYMENT");
    console.log("URL:", url);
    console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("------------------------------------------------");

    const response = await axios.post(url, payload, { headers });

    console.log("------------------------------------------------");
    console.log("🟢 PAYMENT SUCCESS RESPONSE");
    console.log("STATUS:", response.status);
    console.log("FULL DATA:", JSON.stringify(response.data, null, 2));
    console.log("------------------------------------------------");

    return {
      success: true,
      message: 'Payment initiated',
      data: response.data
    };

  } catch (error: any) {
    console.log("------------------------------------------------");
    console.log("🔴 PAYMENT API ERROR");
    if (axios.isAxiosError(error) && error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", JSON.stringify(error.response.data, null, 2));
      return {
        success: false,
        message: error.response.data.message || 'Payment initiation failed'
      };
    }
    console.error("ERROR OBJ:", error);
    console.log("------------------------------------------------");
    return { success: false, message: 'Network error occurred' };
  }
};