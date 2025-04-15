import {
  CheckCurrentUserActivationDto,
  CreateActivationDto,
  Login,
  LoginResponse,
} from "../models/auth";
import { environment } from "../utils/environment";
import { http } from "../utils/http";
import MD5 from "crypto-js/md5";

export async function loginByEmail(data: Login) {
  const response: LoginResponse = await http.post(
    `${environment?.baseUrl}/auth/login`,
    {
      email: data.email,
      password: MD5(data.password).toString(),
    }
  );
  return {
    user: response.user,
    token: response.accessToken,
  };
}

export function registerByEmail(data: Login) {
  return http.post(`${environment?.baseUrl}/users`, {
    email: data.email,
    password: MD5(data.password).toString(),
  });
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
