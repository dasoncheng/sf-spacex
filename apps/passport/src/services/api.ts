// Base API configuration
import { useAuthStore } from "@/store/auth";
import { environment } from "@/utils/environment";

const getAccount = () => {
  const account = localStorage.getItem("account");
  if (account) {
    return JSON.parse(account);
  }
};

const WHITE_LIST = ["/passwordToLogin"];
// Common headers for API requests

type HeadersWithAuth = {
  "Content-Type": string;
  Authorization?: string;
};

const getHeaders = (url: string): HeadersWithAuth => {
  const headers: HeadersWithAuth = {
    "Content-Type": "application/json",
  };
  const account = getAccount();
  if (!WHITE_LIST.some((item) => url?.includes(item)) && account?.token) {
    headers.Authorization = `Bearer ${account.token}`;
  }
  return headers;
};

// Helper function for handling API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const authStore = useAuthStore();
    switch (response.status) {
      case 401:
        authStore.showLogin();
        break;
      default:
        break;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An error occurred");
  }
  return response.json();
};

// Base API methods
export const api = {
  // GET request
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${environment.value?.baseUrl}${endpoint}`, {
      method: "GET",
      headers: getHeaders(endpoint),
    });
    return handleResponse(response);
  },

  // POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${environment.value?.baseUrl}${endpoint}`, {
      method: "POST",
      headers: getHeaders(endpoint),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${environment.value?.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(endpoint),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${environment.value?.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(endpoint),
    });
    return handleResponse(response);
  },
};
