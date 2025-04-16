export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface User {
  Id: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
}
export interface Login {
  email: string;
  password: string;
}

export interface AccountInfo {
  user: User;
  token: string;
}

export interface CheckCurrentUserActivationDto {
  fingerprint: string;
  applicationId: string;
}
export interface CreateActivationDto {
  fingerprint: string;
  licenseKey: string;
  applicationId: string;
}
export interface ActivationStatusBoolDto {
  isActive: boolean;
  ActivatedAt: string | null;
  ExpiresAt: string | null;
}
