import { http } from "../utils/http";
import type { Permission } from "@/types/api";

// 获取所有权限
export async function getPermissions(): Promise<Permission[]> {
  return http.get<Permission[]>("/permissions");
}

// 获取单个权限
export async function getPermissionById(id: string): Promise<Permission> {
  return http.get<Permission>(`/permissions/${id}`);
}
