import { Login, LoginResponse } from "../stores/auth";
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
