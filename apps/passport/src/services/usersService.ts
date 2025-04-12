import type { User, UserDetail, AssignRoleDto } from "@/types/api";
import { api } from "./api";

export const usersService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    return await api.get("/users");
  },

  // Get user by ID
  async getUserById(id: string): Promise<UserDetail> {
    return await api.get(`/users/${id}`);
  },

  // Create a new user
  async createUser(userData: {
    email: string;
    password: string;
  }): Promise<User> {
    return await api.post("/users", userData);
  },

  // Get user roles
  async getUserRoles(userId: string): Promise<any[]> {
    return await api.get(`/users/${userId}/roles`);
  },

  // Assign role to user
  async assignRole(userId: string, roleId: string): Promise<void> {
    return await api.post(`/users/${userId}/roles/${roleId}`, {});
  },

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<void> {
    return await api.delete(`/users/${userId}/roles/${roleId}`);
  },
};
