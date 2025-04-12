import type {
  Role,
  RoleDetail,
  RoleRequest,
  AssignPermissionRequest,
  AssignUserRequest,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/types/api";
import { api } from "./api";

class RolesService {
  // 获取所有角色列表
  async getRoles(): Promise<Role[]> {
    return await api.get<Role[]>("/roles");
  }

  // 根据ID获取角色详情
  async getRoleById(id: string): Promise<RoleDetail> {
    return await api.get<RoleDetail>(`/roles/${id}`);
  }

  // 创建新角色
  async createRole(roleData: CreateRoleDto): Promise<Role> {
    return await api.post<Role>("/roles", roleData);
  }

  // 更新角色信息
  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Role> {
    return await api.put<Role>(`/roles/${id}`, roleData);
  }

  // 删除角色
  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  }

  // 为角色分配权限
  async assignPermission(
    roleId: string,
    data: AssignPermissionRequest
  ): Promise<void> {
    await api.post(`/roles/${roleId}/permissions`, data);
  }

  // 移除角色权限
  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  }

  // 为角色分配用户
  async assignUser(roleId: string, data: AssignUserRequest): Promise<void> {
    // 使用用户服务中的assignRole接口
    await api.post(`/users/${data.userId}/roles/${roleId}`, {});
  }

  // 从角色中移除用户
  async removeUser(roleId: string, userId: string): Promise<void> {
    // 使用用户服务中的removeRole接口
    await api.delete(`/users/${userId}/roles/${roleId}`);
  }
}

export const rolesService = new RolesService();
