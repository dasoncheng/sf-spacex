import type { AccountInfo, Login, LoginResponse } from "@/types/api";
import { http } from "../utils/http";

export const usersAuth = {
  async login(data: Login): Promise<AccountInfo> {
    const response = await http.post<LoginResponse>("/auth/login", data);
    // 将LoginResponse转换为AccountInfo
    return {
      user: response.user,
      token: response.accessToken,
    };
  },
};
