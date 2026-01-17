import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { IDENTITY_BASE_URL } from "./baseURL/identityBaseURL";

export interface Tenant {
  id: string;
  name: string;
  industry: string;
  status: string;
  created_at: string;
}

// Response from the Backend
interface TenantListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tenant[];
}

// Return type for our App (includes meta for pagination)
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
  const token = await SecureStore.getItemAsync("userToken");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `JWT ${token}`,
  };
};

// Check Name
export const checkTenantName = async (
  name: string,
  industry: string = "Basic",
) => {
  try {
    const headers = await getAuthHeaders();
    const payload = { name, industry, status: "Active" };
    const response = await axios.post(
      `${IDENTITY_BASE_URL}/tenant/check-tenant-name/`,
      payload,
      { headers },
    );
    return {
      success: true,
      message: response.data.message || "Company name available",
    };
  } catch (error: any) {
    return { success: false, message: "Unavailable" };
  }
};

// Create Tenant
export const createTenant = async (name: string, industry: string) => {
  try {
    const headers = await getAuthHeaders();
    const payload = { name, industry, status: "Active" };
    const response = await axios.post(`${IDENTITY_BASE_URL}/tenant/`, payload, {
      headers,
    });
    console.log(response.data);
    
    return { success: true, message: "Created", data: response.data };
  } catch (error: any) {
    return { success: false, message: `${error.message}` };
    // console.log(response);
  }
};

// Get Tenants (Paginated)
export const getTenants = async (
  page: number = 1,
): Promise<ApiResponse<Tenant[]>> => {
  try {
    const headers = await getAuthHeaders();
    // Pass page query parameter
    const response = await axios.get<TenantListResponse>(
      `${IDENTITY_BASE_URL}/tenant/?page=${page}`,
      { headers },
    );

    return {
      success: true,
      data: response.data.results,
      meta: {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      },
    };
  } catch (error: any) {
    console.error("Get Tenants Error:", error);
    return { success: false, message: "Network error" };
  }
};

export const updateTenant = async (
  id: string,
  data: { name?: string; industry?: string },
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(
      `${IDENTITY_BASE_URL}/tenant/${id}/`,
      data,
      { headers },
    );
    return {
      success: true,
      message: "Tenant updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Update Tenant Error:", error);
    return { success: false, message: "Failed to update tenant" };
  }
};

export const deleteTenant = async (id: string) => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${IDENTITY_BASE_URL}/tenant/${id}/`, { headers });
    return { success: true, message: "Tenant deleted successfully" };
  } catch (error: any) {
    console.error("Delete Tenant Error:", error);
    return { success: false, message: "Failed to delete tenant" };
  }
};
