import {
  CheckCurrentUserActivationDto,
  CreateActivationDto,
  Login,
  LoginResponse,
} from "../models/auth";
import { environment } from "../utils/environment";
import { http } from "../utils/http";

export async function loginByEmail(data: Login) {
  const response: LoginResponse = await http.post(
    `${environment.baseUrl}/auth/login`,
    data
  );
  return {
    user: response.user,
    token: response.accessToken,
  };
}

export function registerByEmail(data: Login) {
  return http.post(`${environment.baseUrl}/users`, data);
}

// 验证是否激活
export function getActivationsStatus(
  params: CheckCurrentUserActivationDto
): Promise<{ isActive: boolean }> {
  return http.get(`${environment?.baseUrl}/applications/activate`, {
    params,
  });
}

// 激活
export function ceateActivation(params: CreateActivationDto) {
  return http.post(`${environment?.baseUrl}/applications/activate`, params);
}
