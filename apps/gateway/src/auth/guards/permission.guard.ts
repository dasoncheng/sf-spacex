import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果路由没有指定任何权限要求，则允许访问
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 如果没有用户信息，则表示未通过身份验证
    if (!user) {
      return false;
    }

    // 获取用户的角色及其拥有的所有权限
    const userWithRoles = await this.prisma.user.findUnique({
      where: { Id: user.userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return false;
    }

    // 提取用户所有角色拥有的权限名称
    const userPermissions = new Set();
    for (const userRole of userWithRoles.roles) {
      for (const rolePermission of userRole.role.permissions) {
        userPermissions.add(rolePermission.permission.Name);
      }
    }

    // 检查用户是否拥有任一所需权限
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );

    if (!hasRequiredPermission) {
      throw new ForbiddenException('您没有执行此操作的权限');
    }

    return true;
  }
}
