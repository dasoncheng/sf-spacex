import { api } from "./api";
import type { CreateUserDto, User, UserDetail } from "@/types/api";

export const usersService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    return api.get<User[]>("/users");
  },

  // Get user by ID
  async getUserById(id: string): Promise<UserDetail> {
    return api.get<UserDetail>(`/users/${id}`);
  },

  // Create a new user
  async createUser(user: CreateUserDto): Promise<User> {
    return api.post<User>("/users", user);
  },
};
