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
