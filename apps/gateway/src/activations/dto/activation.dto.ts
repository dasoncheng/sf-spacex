import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActivationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  licenseKey: string;

  @IsString()
  @IsNotEmpty()
  fingerprint: string;
}

export class ActivationResponseDto {
  Id: string;
  UserId: string;
  ApplicationId: string;
  LicenseId: string;
  Fingerprint: string;
  ActivatedAt: Date;
  ExpiresAt?: Date;
}

export class ValidityCheckDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;
}

export class ValidityResponseDto {
  isValid: boolean;
  expiresAt?: Date;
  remainingSeconds?: number;
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
}
