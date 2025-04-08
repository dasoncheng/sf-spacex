import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLicenseDto {
  @IsInt()
  @IsOptional()
  ExpiresAt?: number; // Duration in seconds
}

export class BatchCreateLicenseDto {
  @IsInt()
  @IsNotEmpty()
  count: number;

  @IsInt()
  @IsOptional()
  ExpiresAt?: number; // Duration in seconds
}

export class LicenseResponseDto {
  Id: string;
  LicenseKey: string;
  IsUsed: boolean;
  ExpiresAt?: number; // Duration in seconds
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
