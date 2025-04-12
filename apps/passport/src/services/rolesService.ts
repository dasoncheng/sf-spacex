import { api } from "./api";
import type {
  Role,
  RoleDetail,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
  AssignPermissionDto,
} from "@/types/api";

export const rolesService = {
  // Get all roles
  async getRoles(): Promise<Role[]> {
    return api.get<Role[]>("/roles");
  },

  // Get role by ID
  async getRoleById(id: string): Promise<RoleDetail> {
    return api.get<RoleDetail>(`/roles/${id}`);
  },

  // Create a new role
  async createRole(role: CreateRoleDto): Promise<Role> {
    return api.post<Role>("/roles", role);
  },

  // Update a role
  async updateRole(id: string, role: UpdateRoleDto): Promise<Role> {
    return api.put<Role>(`/roles/${id}`, role);
  },

  // Delete a role
  async deleteRole(id: string): Promise<void> {
    return api.delete<void>(`/roles/${id}`);
  },

  // Assign a permission to a role
  async assignPermission(
    roleId: string,
    assignPermissionDto: AssignPermissionDto
  ): Promise<void> {
    return api.post<void>(`/roles/${roleId}/permissions`, assignPermissionDto);
  },

  // Remove a permission from a role
  async removePermission(roleId: string, permissionId: string): Promise<void> {
    return api.delete<void>(`/roles/${roleId}/permissions/${permissionId}`);
  },

  // Get all permissions
  async getPermissions(): Promise<Permission[]> {
    return api.get<Permission[]>("/permissions");
  },
};
