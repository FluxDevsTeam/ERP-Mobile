import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BILLING_BASE_URL } from './baseURL/billingBaseURL';

// ... (Keep existing interfaces: Plan, Subscription, Responses) ...
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

export interface Subscription {
  id: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'trial' | 'suspended';
  start_date: string;
  end_date: string;
  remaining_days: number;
  tenant_id: string;
  auto_renew?: boolean;
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

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`,
  };
};

// ... (Keep getBillingPlans and getUserSubscriptions as they were) ...
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
    const url = `${BILLING_BASE_URL}/billing/subscriptions/?page=${page}`; 
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
    return { success: false, message: 'Failed to fetch subscriptions' };
  }
};

// --- UPDATED ACTIVATE TRIAL ---
export const activateTrial = async (planId: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BILLING_BASE_URL}/billing/subscriptions/activate-trial/`;
    
    // Construct Payload
    const payload = { plan_id: planId };
    
    console.log("------------------------------------------------");
    console.log("🔵 ACTIVATING TRIAL REQUEST");
    console.log("URL:", url);
    console.log("HEADERS:", JSON.stringify(headers, null, 2));
    console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("------------------------------------------------");

    const response = await axios.post(url, payload, { headers });

    console.log("🟢 ACTIVATE TRIAL SUCCESS");
    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(response.data, null, 2));
    console.log("------------------------------------------------");

    return {
      success: true,
      message: response.data.message || 'Trial activated successfully',
      data: response.data
    };

  } catch (error: any) {
    console.log("------------------------------------------------");
    console.log("🔴 ACTIVATE TRIAL ERROR");
    
    if (axios.isAxiosError(error) && error.response) {
      console.log("STATUS CODE:", error.response.status);
      console.log("ERROR DATA:", JSON.stringify(error.response.data, null, 2));
      
      return { 
        success: false, 
        message: error.response.data.message || error.response.data.detail || 'Failed to activate trial' 
      };
    }
    
    console.error("ERROR OBJ:", error);
    console.log("------------------------------------------------");
    return { success: false, message: 'Network error occurred' };
  }
};

// ... (Keep deleteSubscription) ...
export const deleteSubscription = async (id: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BILLING_BASE_URL}/billing/subscriptions/${id}/`;
    const response = await axios.delete(url, { headers });
    return { success: true, message: response.data.message || 'Subscription deleted successfully' };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data.message || 'Failed to delete subscription' };
    }
    return { success: false, message: 'Network error occurred' };
  }
};

export const deletePlan = async (id: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BILLING_BASE_URL}/billing/plans/${id}/`;
    
    console.log("🔴 DELETING PLAN:", id);

    const response = await axios.delete(url, { headers });

    return {
      success: true,
      message: response.data.message || 'Plan deleted successfully'
    };

  } catch (error: any) {
    console.log("🔴 DELETE PLAN ERROR");
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: error.response.data.message || 'Failed to delete plan' 
      };
    }
    return { success: false, message: 'Network error occurred' };
  }
};