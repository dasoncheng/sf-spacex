import type { AccountInfo, Login, LoginResponse } from "@/types/api";
import { http } from "../utils/http";
import MD5 from "crypto-js/md5";

export const usersAuth = {
  async login(data: Login): Promise<AccountInfo> {
    const response = await http.post<LoginResponse>("/auth/login", {
      email: data.email,
      password: MD5(data.password).toString(),
    });
    // 将LoginResponse转换为AccountInfo
    return {
      user: response.user,
      token: response.accessToken,
    };
  },
};
