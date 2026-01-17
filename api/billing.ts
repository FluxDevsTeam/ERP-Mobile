import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BILLING_BASE_URL } from './baseURL/billingBaseURL';

// --- INTERFACES ---

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

// Matches the JSON you provided
export interface Subscription {
  id: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'trial' | 'suspended';
  start_date: string;
  end_date: string;
  remaining_days: number;
  auto_renew?: boolean; // Not in JSON, but in UI. We'll default to true/false logic.
}

interface PlansResponse {
  count: number;
  results: Plan[];
}

interface SubscriptionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subscription[];
}

// --- HELPERS ---
const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`,
  };
};

// --- API CALLS ---

export const getBillingPlans = async () => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BILLING_BASE_URL}/billing/plans/`;
    const response = await axios.get<PlansResponse>(url, { headers });
    return { success: true, data: response.data.results };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data.message || 'Failed to load plans' };
    }
    return { success: false, message: 'Network error occurred' };
  }
};

export const getUserSubscriptions = async (page: number = 1) => {
  try {
    const headers = await getAuthHeaders();
    // Append page query param
    const url = `${BILLING_BASE_URL}/billing/subscriptions/?page=${page}`; 
    
    console.log("🔵 FETCHING SUBSCRIPTIONS PAGE:", page);
    
    const response = await axios.get<SubscriptionsResponse>(url, { headers });

    return {
      success: true,
      data: response.data.results,
      meta: {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      }
    };

  } catch (error: any) {
    console.log("🔴 SUBSCRIPTION API ERROR", error);
    return { success: false, message: 'Failed to fetch subscriptions' };
  }
};