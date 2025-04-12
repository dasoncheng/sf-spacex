/**
 * 已认证用户接口 - 定义认证后请求中携带的用户信息结构
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

// 包含用户信息的请求接口
export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}
