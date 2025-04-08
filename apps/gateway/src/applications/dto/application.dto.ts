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
