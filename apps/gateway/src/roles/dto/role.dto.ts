import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Expose, Type, Transform, plainToInstance } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class PermissionDto {
  @Expose({ name: 'Id' })
  @IsUUID()
  id: string;

  @Expose({ name: 'Name' })
  @IsString()
  name: string;

  @Expose({ name: 'Resource' })
  @IsString()
  resource: string;

  @Expose({ name: 'Action' })
  @IsString()
  action: string;

  @Expose({ name: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @Expose({ name: 'CreatedAt' })
  createdAt: Date;

  @Expose({ name: 'UpdatedAt' })
  updatedAt: Date;
}

export class RoleDto {
  @Expose({ name: 'Id' })
  @IsUUID()
  id: string;

  @Expose({ name: 'Name' })
  @IsString()
  name: string;

  @Expose({ name: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @Expose({ name: 'CreatedAt' })
  createdAt: Date;

  @Expose({ name: 'UpdatedAt' })
  updatedAt: Date;

  @Transform(({ obj }: { obj: { Permissions?: { Permission: object }[] } }) => {
    if (obj && obj.Permissions) {
      return plainToInstance(
        PermissionDto,
        obj.Permissions.map((item) => item.Permission),
        {
          excludeExtraneousValues: true,
        },
      );
    }
  })
  @Type(() => PermissionDto)
  @Expose()
  permissions?: PermissionDto[];
}

export class AssignPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  permissionId: string;
}
