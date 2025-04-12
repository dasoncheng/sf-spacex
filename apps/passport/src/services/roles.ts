import type {
  Role,
  RoleDetail,
  RoleRequest,
  AssignPermissionRequest,
  AssignUserRequest,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/types/api";
import { http } from "../utils/http";

// 获取所有角色列表
export async function getRoles(): Promise<Role[]> {
  return await http.get<Role[]>("/roles");
}

// 根据ID获取角色详情
export async function getRoleById(id: string): Promise<RoleDetail> {
  return await http.get<RoleDetail>(`/roles/${id}`);
}

// 创建新角色
export async function createRole(roleData: CreateRoleDto): Promise<Role> {
  return await http.post<Role>("/roles", roleData);
}

// 更新角色信息
export async function updateRole(
  id: string,
  roleData: UpdateRoleDto
): Promise<Role> {
  return await http.put<Role>(`/roles/${id}`, roleData);
}

// 删除角色
export async function deleteRole(id: string): Promise<void> {
  await http.delete(`/roles/${id}`);
}

// 为角色分配权限
export async function assignPermission(
  roleId: string,
  data: AssignPermissionRequest
): Promise<void> {
  await http.post(`/roles/${roleId}/permissions`, data);
}

// 移除角色权限
export async function removePermission(
  roleId: string,
  permissionId: string
): Promise<void> {
  await http.delete(`/roles/${roleId}/permissions/${permissionId}`);
}

// 为角色分配用户
export async function assignUser(
  roleId: string,
  data: AssignUserRequest
): Promise<void> {
  // 使用用户服务中的assignRole接口
  await http.post(`/users/${data.userId}/roles/${roleId}`, {});
}

// 从角色中移除用户
export async function removeUser(
  roleId: string,
  userId: string
): Promise<void> {
  // 使用用户服务中的removeRole接口
  await http.delete(`/users/${userId}/roles/${roleId}`);
}
