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
    `${environment.value?.baseUrl}/auth/login`,
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
  return http.post(`${environment.value?.baseUrl}/users`, {
    email: data.email,
    password: MD5(data.password).toString(),
  });
}

export function getActivationsStatus(
  params: CheckCurrentUserActivationDto
): Promise<{ isActive: boolean }> {
  return http.get(`${environment.value?.baseUrl}/applications/activate`, {
    params,
  });
}

export function ceateActivation(params: CreateActivationDto) {
  return http.post(
    `${environment.value?.baseUrl}/applications/activate`,
    params
  );
}
