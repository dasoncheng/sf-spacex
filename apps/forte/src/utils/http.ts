import axios from "axios";

const http = axios.create();

http.interceptors.request.use((config) => {
  return config;
});

http.interceptors.response.use((response) => {
  return response.data;
});

export { http };
