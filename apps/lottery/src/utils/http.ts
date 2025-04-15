import axios, { RawAxiosRequestHeaders } from "axios";
import { mergeWith, omit } from "lodash-es";
import { environment } from "./environment";

const getAccount = () => {
  const account = localStorage.getItem("account");
  if (account) {
    return JSON.parse(account);
  }
};

const noTokenUrlPatterns = ["api/v3/Room/detail", "/auth/login", "/users"];

const http = axios.create();

http.interceptors.request.use((config) => {
  if (config?.headers?.["996"] ?? false) {
    config.headers = mergeWith(
      {
        Appv: environment[996].appv,
        "Box-Agent": `device:${environment[996].device};channel:;appv:${environment[996].appv};`,
        // token:
        //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl92ZXJzaW9uIjoiVjEiLCJzdWIiOjEyMTcxNTU5NTcsImRldmljZV9pZCI6ImY0OmYxOjllOjJhOmM0OjZiIiwiYXBwX3ZlcnNpb24iOiI0LjQuMS45MDA3IiwibG9naW5fdGltZSI6MTc0MjQ1NDg5MSwiaXNzIjoiOTk2Ym94IiwiZXhwIjoxNzQ1MDQ2ODkxLCJkZXZpY2UiOiJwYyIsImlhdCI6MTc0MjQ1NDg5MSwianRpIjoiSXZnSXZ6Y1FKdkNyQktYMiJ9.amGS5w27zOx3KwDrQbZlatgWrAkQbn9y6znEZ1GOh8I",
      },
      omit(config.headers, "996")
    );
  }

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
