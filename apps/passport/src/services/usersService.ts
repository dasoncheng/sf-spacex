import type { User, UserDetail } from "@/types/api";
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
};
