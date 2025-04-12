import { http } from "../utils/http";
import type { UserInfo, UserDetail } from "@/types/api";

class UsersService {
  // 获取所有用户列表
  async getUsers(): Promise<UserInfo[]> {
    return await http.get<UserInfo[]>("/users");
  }

  // 根据ID获取用户详情
  async getUserById(id: string): Promise<UserDetail> {
    return await http.get<UserDetail>(`/users/${id}`);
  }

  // 获取用户的角色列表
  async getUserRoles(userId: string): Promise<any> {
    return await http.get(`/users/${userId}/roles`);
  }

  // 根据角色ID获取该角色下的用户列表
  async getUsersByRoleId(roleId: string): Promise<UserInfo[]> {
    // 这里我们需要添加一个新的API来获取角色下的用户
    // 由于gateway项目中没有直接提供此API，我们可能需要在Gateway中添加
    // 目前可以先调用已有的API，然后在前端进行过滤
    const allUsers = await this.getUsers();
    const roleUsers: UserInfo[] = [];

    // 为每个用户获取角色信息，如果包含当前roleId则添加到结果中
    for (const user of allUsers) {
      try {
        const userDetail = await this.getUserById(user.id);
        if (
          userDetail.roles &&
          userDetail.roles.some((role) => role.id === roleId)
        ) {
          roleUsers.push(user);
        }
      } catch (error) {
        console.error(`Error fetching roles for user ${user.id}:`, error);
      }
    }

    return roleUsers;
  }

  // 获取未分配给指定角色的用户列表
  async getUnassignedUsers(roleId: string): Promise<UserInfo[]> {
    const allUsers = await this.getUsers();
    const assignedUsers = await this.getUsersByRoleId(roleId);

    // 过滤掉已分配的用户
    const assignedUserIds = assignedUsers.map((user) => user.id);
    return allUsers.filter((user) => !assignedUserIds.includes(user.id));
  }

  // 为用户分配角色
  async assignRole(userId: string, roleId: string): Promise<void> {
    await http.post(`/users/${userId}/roles/${roleId}`, {});
  }

  // 移除用户角色
  async removeRole(userId: string, roleId: string): Promise<void> {
    await http.delete(`/users/${userId}/roles/${roleId}`);
  }
}

export const usersService = new UsersService();
