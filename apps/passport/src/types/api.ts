// User types
export interface User {
  Id: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface UserDetail extends User {
  applications: {
    Id: string;
    Name: string;
    AppKey: string;
    activatedAt: string;
    expiresAt?: string;
  }[];

  roles?: Role[];
}

export interface CreateUserDto {
  Email: string;
  Password: string;
}

// Role types
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface AssignRoleDto {
  roleId: string;
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt?: string;
  updatedAt?: string;
}

// User information
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

// Role request parameters
export interface RoleRequest {
  name: string;
  description?: string;
}

// Permission assignment request parameters
export interface AssignPermissionRequest {
  permissionId: string;
}

// User assignment request parameters
export interface AssignUserRequest {
  userId: string;
}

export interface AssignPermissionDto {
  permissionId: string;
}

// Application types
export interface Application {
  Id: string;
  Name: string;
  Description?: string;
  AppKey: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ApplicationDetail extends Application {
  users: {
    Id: string;
    Email: string;
    activatedAt: string;
    expiresAt?: string;
  }[];
}

export interface CreateApplicationDto {
  Name: string;
  Description?: string;
}

// License types
export interface License {
  Id: string;
  LicenseKey: string;
  Duration: number; // Duration in days, -1 for permanent
  Status: number; // 0: unused, 1: used
  CreatedAt: string;
  UpdatedAt: string;
}

export interface LicenseDetail extends License {
  activation?: {
    Id: string;
    Fingerprint: string;
    ActivatedAt: string;
    ExpiresAt?: string;
    user: {
      Id: string;
      Email: string;
    };
    application: {
      Id: string;
      Name: string;
      AppKey: string;
    };
  };
}

export interface CreateLicenseDto {
  Duration?: number; // Duration in days, -1 for permanent
}

export interface BatchCreateLicenseDto {
  count: number;
  Duration?: number; // Duration in days, -1 for permanent
}

// Activation types
export interface CreateActivationDto {
  userId: string;
  applicationId: string;
  licenseKey: string;
  fingerprint: string;
}

export interface ValidityCheckDto {
  userId: string;
  applicationId: string;
}

export interface ValidityResponseDto {
  isValid: boolean;
  expiresAt?: string;
  remainingSeconds?: number;
}

// Auth types - updated to match the gateway API
export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface AccountInfo {
  user: User;
  token: string;
}
