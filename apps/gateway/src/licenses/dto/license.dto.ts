import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLicenseDto {
  @IsInt()
  @IsOptional()
  Duration?: number; // Duration in days, -1 for permanent
}

export class BatchCreateLicenseDto {
  @IsInt()
  @IsNotEmpty()
  count: number;

  @IsInt()
  @IsOptional()
  Duration?: number; // Duration in days, -1 for permanent
}

export class LicenseResponseDto {
  Id: string;
  LicenseKey: string;
  Duration: number; // Duration in days
  Status: number; // 0: unused, 1: used
  CreatedAt: Date;
  UpdatedAt: Date;
}

export class LicenseDetailDto extends LicenseResponseDto {
  activation?: {
    Id: string;
    Fingerprint: string;
    ActivatedAt: Date;
    ExpiresAt?: Date;
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
