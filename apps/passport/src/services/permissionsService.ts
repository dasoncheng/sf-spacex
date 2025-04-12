import { http } from "../utils/http";
import type { Permission } from "@/types/api";

export const permissionsService = {
  // 获取所有权限
  async getPermissions(): Promise<Permission[]> {
    return http.get<Permission[]>("/permissions");
  },

  // 获取单个权限
  async getPermissionById(id: string): Promise<Permission> {
    return http.get<Permission>(`/permissions/${id}`);
  },
};
