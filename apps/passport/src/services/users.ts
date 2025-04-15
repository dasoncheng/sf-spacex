import MD5 from "crypto-js/md5";
import { http } from "../utils/http";
import type { UserInfo, UserDetail, User } from "@/types/api";

// 获取所有用户列表
export async function getUsers(): Promise<UserInfo[]> {
  return await http.get<UserInfo[]>("/users");
}

// 根据ID获取用户详情
export async function getUserById(id: string): Promise<UserDetail> {
  return await http.get<UserDetail>(`/users/${id}`);
}

// 获取用户的角色列表
export async function getUserRoles(userId: string): Promise<any> {
  return await http.get(`/users/${userId}/roles`);
}

// Create a new user
export async function createUser(userData: {
  email: string;
  password: string;
}): Promise<User> {
  return await http.post("/users", {
    email: userData.email,
    password: MD5(userData.password).toString(),
  });
}
// 根据角色ID获取该角色下的用户列表
export async function getUsersByRoleId(roleId: string): Promise<UserInfo[]> {
  // 这里我们需要添加一个新的API来获取角色下的用户
  // 由于gateway项目中没有直接提供此API，我们可能需要在Gateway中添加
  // 目前可以先调用已有的API，然后在前端进行过滤
  const allUsers = await getUsers();
  const roleUsers: UserInfo[] = [];

  // 为每个用户获取角色信息，如果包含当前roleId则添加到结果中
  for (const user of allUsers) {
    try {
      const userDetail = await getUserById(user.id);
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
export async function getUnassignedUsers(roleId: string): Promise<UserInfo[]> {
  const allUsers = await getUsers();
  const assignedUsers = await getUsersByRoleId(roleId);

  // 过滤掉已分配的用户
  const assignedUserIds = assignedUsers.map((user) => user.id);
  return allUsers.filter((user) => !assignedUserIds.includes(user.id));
}

// 为用户分配角色
export async function assignRole(
  userId: string,
  roleId: string
): Promise<void> {
  await http.post(`/users/${userId}/roles/${roleId}`, {});
}

// 移除用户角色
export async function removeRole(
  userId: string,
  roleId: string
): Promise<void> {
  await http.delete(`/users/${userId}/roles/${roleId}`);
}
