import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IDENTITY_BASE_URL } from './baseURL/identityBaseURL';

export interface Branch {
  id: string;
  name?: string; 
  location?: string;
  created_at?: string;
  [key: string]: any; 
}

interface BranchListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  status?: number; // Added status code to interface
  data?: T;
  meta?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`,
  };
};

// --- READ (GET) ---
export const getBranches = async (page: number = 1): Promise<ApiResponse<Branch[]>> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${IDENTITY_BASE_URL}/branch/?page=${page}`;
    
    console.log(`🔵 GETTING BRANCHES (Page ${page}):`, url);
    const response = await axios.get<BranchListResponse>(url, { headers });

    return {
      success: true,
      status: response.status,
      data: response.data.results,
      meta: {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      }
    };
  } catch (error: any) {
    console.log("🔴 GET BRANCHES ERROR");
    if (axios.isAxiosError(error) && error.response) {
      console.log("🔴 STATUS CODE:", error.response.status);
      console.log("🔴 ERROR DATA:", JSON.stringify(error.response.data, null, 2));
      return { 
        success: false, 
        status: error.response.status,
        message: 'Failed to fetch branches' 
      };
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// --- CHECK NAME (POST) ---
export const checkBranchName = async (name: string, location: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${IDENTITY_BASE_URL}/branch/check-branch-name/`;
    const payload = { name, location };

    console.log("🔵 CHECKING BRANCH NAME:", payload);
    const response = await axios.post(url, payload, { headers });

    console.log("🟢 CHECK SUCCESS STATUS:", response.status);

    return { 
      success: true, 
      status: response.status,
      message: response.data.message || 'Branch name available' 
    };

  } catch (error: any) {
    console.log("🔴 CHECK ERROR");
    
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      console.log("🔴 STATUS CODE:", status);
      
      // Default message
      let message = 'Branch name is already taken or invalid';
      
      return { success: false, status, message };
    }
    return { success: false, message: 'Unable to verify name' };
  }
};

// --- CREATE (POST) ---
export const createBranch = async (name: string, location: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${IDENTITY_BASE_URL}/branch/`;
    const payload = { name, location };

    console.log("🔵 CREATING BRANCH PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, { headers });

    console.log("🟢 CREATE BRANCH STATUS:", response.status);
    console.log("🟢 CREATE BRANCH DATA:", JSON.stringify(response.data, null, 2));

    return {
      success: true,
      status: response.status,
      message: 'Branch created successfully',
      data: response.data
    };

  } catch (error: any) {
    console.log("🔴 CREATE BRANCH ERROR");
    
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.log("🔴 STATUS CODE:", status);
      console.log("🔴 ERROR DATA:", JSON.stringify(errorData, null, 2));
      
      let message = errorData.message || errorData.detail || 'Failed to create branch';

      // --- ERROR CODE LOGIC ---
      if (status === 400) {
        message = "You need to create a Tenant (Company) before adding branches.";
      } 
      else if (status === 403) {
        message = "You have no active subscription. Please subscribe to a plan to create branches.";
      }

      return { success: false, status, message };
    }
    
    console.log("🔴 ERROR:", error.message);
    return { success: false, message: 'Network error occurred' };
  }
};