import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IDENTITY_BASE_URL } from './baseURL/identityBaseURL';

export interface TenantRequest {
  name: string;
  industry: string;
  status: string;
}

// --- HELPER: GET TOKEN ---
const getAuthHeaders = async () => {
  // Must match the key used in login.ts ('userToken')
  const token = await SecureStore.getItemAsync('userToken');
  
  if (!token) {
    console.warn("⚠️ No token found in SecureStore. User might need to login again.");
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`, 
  };
};

// --- API CALLS ---

export const checkTenantName = async (name: string, industry: string = "Basic") => {
  try {
    const headers = await getAuthHeaders(); // <--- Token injected here
    
    const payload = { name, industry, status: "Active" };
    const response = await axios.post(`${IDENTITY_BASE_URL}/tenant/check-tenant-name/`, payload, { headers });
    
    return { 
      success: true, 
      message: response.data.message || 'Company name available' 
    };

  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // 409 or 400 usually means taken
      return { success: false, message: 'Company name is already taken' };
    }
    return { success: false, message: 'Unable to verify name' };
  }
};

export const createTenant = async (name: string, industry: string) => {
  try {
    const headers = await getAuthHeaders(); // <--- Token injected here

    const payload: TenantRequest = { name, industry, status: "Active" };
    
    console.log("Creating Tenant with Token...");
    const response = await axios.post(`${IDENTITY_BASE_URL}/tenant/`, payload, { headers });

    return {
      success: true,
      message: 'Company created successfully',
      data: response.data
    };

  } catch (error: any) {
    console.error("Create Tenant Error:", error);
    if (axios.isAxiosError(error) && error.response) {
      // Log details if it fails again
      console.log("Error Details:", error.response.data);
      return {
        success: false,
        message: error.response.data.message || 'Failed to create company'
      };
    }
    return { success: false, message: 'Network error occurred' };
  }
};