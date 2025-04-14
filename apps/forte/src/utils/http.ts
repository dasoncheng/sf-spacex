import axios from "axios";
import { useAuthStore } from "../stores/auth";

const getAccount = () => {
  const account = localStorage.getItem("account");
  if (account) {
    return JSON.parse(account);
  }
};

const noTokenUrlPatterns = ["api/users", "api/auth/login"];

const http = axios.create();

http.interceptors.request.use((config) => {
  config.headers = config.headers;
  if (
    !noTokenUrlPatterns.some((pattern) => {
      return config.url?.includes(pattern);
    })
  ) {
    const account = getAccount();
    if (account.token) {
      config.headers.Authorization = `Bearer ${account.token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    switch (response.status) {
      case 401:
        const authStore = useAuthStore();
        authStore.logout();
        authStore.openLoginDialog();
        break;
      default:
        return response.data;
    }
  },
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);

export { http };
