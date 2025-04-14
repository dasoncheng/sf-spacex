import axios, { RawAxiosRequestHeaders } from "axios";
import { mergeWith } from "lodash-es";

// Common headers used across 996box API requests
const commonHeaders: RawAxiosRequestHeaders = {
  appv: "4.4.1.9007",
  "box-agent":
    "device:pc;channel:;appv:4.4.1.9007;deviceOs:win32 10.0.22631 32bit;deviceId:f4:f1:9e:2a:c4:6b;deviceBrand:;deviceModel:;netType:;gameOwner:;isSimulator:false;",
  token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl92ZXJzaW9uIjoiVjEiLCJzdWIiOjEyMTcxNTU5NTcsImRldmljZV9pZCI6ImY0OmYxOjllOjJhOmM0OjZiIiwiYXBwX3ZlcnNpb24iOiI0LjQuMS45MDA3IiwibG9naW5fdGltZSI6MTc0MjQ1NDg5MSwiaXNzIjoiOTk2Ym94IiwiZXhwIjoxNzQ1MDQ2ODkxLCJkZXZpY2UiOiJwYyIsImlhdCI6MTc0MjQ1NDg5MSwianRpIjoiSXZnSXZ6Y1FKdkNyQktYMiJ9.amGS5w27zOx3KwDrQbZlatgWrAkQbn9y6znEZ1GOh8I",
};

const noTokenUrlPatterns = ["api/v3/Room/detail", "auth/login"];

const http = axios.create();

http.interceptors.request.use((config) => {
  if (config?.headers?.["996"] ?? false) {
    config.headers = mergeWith(commonHeaders, config.headers);
  }

  if (
    !noTokenUrlPatterns.some((pattern) => {
      return config.url?.includes(pattern);
    })
  ) {
    // config.headers.Authorization = `Bearer ${account.token}`;
  }
  return config;
});
http.interceptors.response.use((response) => {
  return response.data;
});

export { http };
