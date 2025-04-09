import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  Email?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  Password?: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password?: string;
}

export class UserResponseDto {
  Id: string;
  Email: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export class UserDetailDto extends UserResponseDto {
  applications: {
    Id: string;
    Name: string;
    AppKey: string;
    activatedAt: Date;
    expiresAt?: Date;
  }[];
}
