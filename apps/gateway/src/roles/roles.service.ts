import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, RoleDto, UpdateRoleDto } from './dto/role.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDto> {
    // 检查角色名是否已存在
    const existingRole = await this.prisma.role.findUnique({
      where: { Name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(`角色名"${createRoleDto.name}"已存在`);
    }

    const role = await this.prisma.role.create({
      data: {
        Name: createRoleDto.name,
        Description: createRoleDto.description,
      },
    });

    return plainToInstance(RoleDto, role, { excludeExtraneousValues: true });
  }

  async findAll() {
    const roles = await this.prisma.role.findMany();
    return roles.map((role) => {
      return plainToInstance(RoleDto, role, { excludeExtraneousValues: true });
    });
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.prisma.role.findUnique({
      where: { Id: id },
      include: {
        Permissions: {
          include: {
            Permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`ID为${id}的角色不存在`);
    }
    return plainToInstance(RoleDto, role, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDto> {
    // 检查角色是否存在
    await this.findOne(id);

    // 如果修改了角色名，检查新的角色名是否已存在
    if (updateRoleDto.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { Name: updateRoleDto.name },
      });

      if (existingRole && existingRole.Id !== id) {
        throw new ConflictException(`角色名"${updateRoleDto.name}"已存在`);
      }
    }

    const role = await this.prisma.role.update({
      where: { Id: id },
      data: {
        Name: updateRoleDto.name,
        Description: updateRoleDto.description,
      },
    });

    return plainToInstance(RoleDto, role, { excludeExtraneousValues: true });
  }

  async remove(id: string): Promise<void> {
    // 检查角色是否存在
    await this.findOne(id);

    // 删除角色
    await this.prisma.role.delete({
      where: { Id: id },
    });
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    // 检查角色是否存在
    await this.findOne(roleId);

    // 检查权限是否存在
    const permission = await this.prisma.permission.findUnique({
      where: { Id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`ID为${permissionId}的权限不存在`);
    }

    // 检查角色是否已经拥有该权限
    const existingRolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        RoleId: roleId,
        PermissionId: permissionId,
      },
    });

    if (existingRolePermission) {
      throw new BadRequestException(`角色已拥有该权限`);
    }

    // 为角色分配权限
    await this.prisma.rolePermission.create({
      data: {
        RoleId: roleId,
        PermissionId: permissionId,
      },
    });
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    // 检查角色是否存在
    await this.findOne(roleId);

    // 检查权限是否存在
    const permission = await this.prisma.permission.findUnique({
      where: { Id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`ID为${permissionId}的权限不存在`);
    }

    // 检查角色是否已经拥有该权限
    const existingRolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        RoleId: roleId,
        PermissionId: permissionId,
      },
    });

    if (!existingRolePermission) {
      throw new BadRequestException(`角色未拥有该权限`);
    }

    // 移除角色权限
    await this.prisma.rolePermission.delete({
      where: {
        Id: existingRolePermission.Id,
      },
    });
  }
}
