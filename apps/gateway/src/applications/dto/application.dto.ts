import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  Name: string;

  @IsString()
  @IsOptional()
  Description?: string;
}

export class ApplicationResponseDto {
  Id: string;
  Name: string;
  Description: string | null;
  AppKey: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export class ApplicationDetailDto extends ApplicationResponseDto {
  users: {
    Id: string;
    Email: string;
    activatedAt: Date;
    expiresAt: Date | null;
  }[];
}

// DTO for checking current user's activation status
export class CheckCurrentUserActivationDto {
  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;
}

// Simple boolean response for activation status check
export class ActivationStatusBoolDto {
  isActive: boolean;
  ActivatedAt: Date | null;
  ExpiresAt: Date | null;
}

// DTO for activating current user
export class ActivateCurrentUserDto {
  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsString()
  @IsNotEmpty()
  licenseKey: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;
}
