import type { AccountInfo, Login } from "@/types/api";
import { api } from "./api";

export const usersAuth = {
  async login(data: Login): Promise<{ token: string }> {
    return await api.post<AccountInfo>("/passwordToLogin", data);
  },
};
