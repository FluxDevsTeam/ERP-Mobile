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

export const getBranches = async (page: number = 1): Promise<ApiResponse<Branch[]>> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${IDENTITY_BASE_URL}/branch/?page=${page}`;

    const response = await axios.get<BranchListResponse>(url, { headers });

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
    return { success: false, message: 'Failed to fetch branches' };
  }
};