import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BILLING_BASE_URL } from './baseURL/billingBaseURL';

export interface Plan {
  id: string;
  name: string;
  description: string;
  industry: string;
  max_users: number;
  max_branches: number;
  price: string;
  billing_period: 'monthly' | 'quarterly' | 'annual';
  tier_level: string;
}

interface PlansResponse {
  count: number;
  results: Plan[];
}

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`, // Using JWT format
  };
};

export const getBillingPlans = async () => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BILLING_BASE_URL}/billing/plans/`;
    
    // console.log("Fetching Plans from:", url);
    const response = await axios.get<PlansResponse>(url, { headers });

    return {
      success: true,
      data: response.data.results
    };

  } catch (error: any) {
    console.error("Billing API Error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data.message || 'Failed to load plans' };
    }
    return { success: false, message: 'Network error occurred' };
  }
};