import axios from "axios";

const getAccount = () => {
  const account = localStorage.getItem("account");
  if (account) {
    return JSON.parse(account);
  }
};

const http = axios.create();

const noTokenUrlPatterns = ["auth/login"];

http.interceptors.request.use((config) => {
  const account = getAccount();
  if (
    !noTokenUrlPatterns.some((pattern) => {
      return config.url?.includes(pattern);
    }) &&
    account.token
  ) {
    config.headers.Authorization = `Bearer ${account.token}`;
  }
  return config;
});

http.interceptors.response.use((response) => {
  return response.data;
});

export { http };
