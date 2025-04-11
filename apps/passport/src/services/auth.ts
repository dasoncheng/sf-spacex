import type { AccountInfo, Login, LoginResponse } from "@/types/api";
import { api } from "./api";

export const usersAuth = {
  async login(data: Login): Promise<AccountInfo> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    // 将LoginResponse转换为AccountInfo
    return {
      user: response.user,
      token: response.accessToken
    };
  },
};
