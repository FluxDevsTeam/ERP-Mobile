import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IDENTITY_BASE_URL } from './baseURL/identityBaseURL';

// We will refine this interface after you paste the console log
export interface Branch {
  id: string;
  name?: string; 
  location?: string;
  created_at?: string;
  [key: string]: any; // Allow any field for now
}

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `JWT ${token}`,
  };
};

export const getBranches = async () => {
  try {
    const headers = await getAuthHeaders();
    const url = `${IDENTITY_BASE_URL}/branch/`;

    console.log("------------------------------------------------");
    console.log("🔵 FETCHING BRANCHES:", url);
    const response = await axios.get(url, { headers });

    console.log("🟢 BRANCH RESPONSE:", JSON.stringify(response.data, null, 2));
    console.log("------------------------------------------------");

    // Assuming standard pagination structure (results array)
    // If different, we will see it in the logs
    return {
      success: true,
      data: response.data.results || response.data // Fallback if no pagination
    };

  } catch (error: any) {
    console.log("🔴 BRANCH API ERROR");
    if (axios.isAxiosError(error) && error.response) {
      console.log("DATA:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error);
    }
    return { success: false, message: 'Failed to fetch branches' };
  }
};