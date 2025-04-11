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
}

export interface CreateUserDto {
  Email: string;
  Password: string;
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
  IsUsed: boolean;
  ExpiresAt?: number; // Duration in seconds
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
  ExpiresAt?: number;
}

export interface BatchCreateLicenseDto {
  count: number;
  ExpiresAt?: number;
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
