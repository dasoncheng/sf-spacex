import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePermissionDto,
  PermissionDto,
  UpdatePermissionDto,
} from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionDto> {
    // 检查权限名是否已存在
    const existingPermission = await this.prisma.permission.findUnique({
      where: { Name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException(`权限名"${createPermissionDto.name}"已存在`);
    }

    const permission = await this.prisma.permission.create({
      data: {
        Name: createPermissionDto.name,
        Description: createPermissionDto.description,
        Resource: createPermissionDto.resource,
        Action: createPermissionDto.action,
      },
    });

    return this.mapToDto(permission);
  }

  async findAll(): Promise<PermissionDto[]> {
    const permissions = await this.prisma.permission.findMany();
    return permissions.map(this.mapToDto);
  }

  async findOne(id: string): Promise<PermissionDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { Id: id },
    });

    if (!permission) {
      throw new NotFoundException(`ID为${id}的权限不存在`);
    }

    return this.mapToDto(permission);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionDto> {
    // 检查权限是否存在
    await this.findOne(id);

    // 如果修改了权限名，检查新的权限名是否已存在
    if (updatePermissionDto.name) {
      const existingPermission = await this.prisma.permission.findUnique({
        where: { Name: updatePermissionDto.name },
      });

      if (existingPermission && existingPermission.Id !== id) {
        throw new ConflictException(`权限名"${updatePermissionDto.name}"已存在`);
      }
    }

    const permission = await this.prisma.permission.update({
      where: { Id: id },
      data: {
        Name: updatePermissionDto.name,
        Description: updatePermissionDto.description,
        Resource: updatePermissionDto.resource,
        Action: updatePermissionDto.action,
      },
    });

    return this.mapToDto(permission);
  }

  async remove(id: string): Promise<void> {
    // 检查权限是否存在
    await this.findOne(id);

    // 删除权限
    await this.prisma.permission.delete({
      where: { Id: id },
    });
  }

  async findByNames(names: string[]): Promise<PermissionDto[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        Name: {
          in: names,
        },
      },
    });

    return permissions.map(this.mapToDto);
  }

  private mapToDto(permission: any): PermissionDto {
    return {
      id: permission.Id,
      name: permission.Name,
      description: permission.Description,
      resource: permission.Resource,
      action: permission.Action,
      createdAt: permission.CreatedAt,
      updatedAt: permission.UpdatedAt,
    };
  }
}
