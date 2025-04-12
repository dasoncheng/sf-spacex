import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

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

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // 如果没有用户信息，则表示未通过身份验证
    if (!user) {
      return false;
    }

    let userPermissions: string[] = [];

    // 首先尝试使用JWT令牌中已包含的权限信息
    if (user.permissions && Array.isArray(user.permissions)) {
      userPermissions = user.permissions;
      this.logger.debug(
        `使用JWT中缓存的权限信息: ${userPermissions.join(', ')}`,
      );
    } else {
      // 如果JWT中没有权限信息，则从数据库查询
      this.logger.debug(
        `JWT中未包含权限信息，从数据库查询用户ID: ${user.userId}`,
      );

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
        this.logger.warn(`未找到用户 ID: ${user.userId}`);
        return false;
      }

      // 提取用户所有角色拥有的权限名称
      const permissionsSet = new Set<string>();
      for (const userRole of userWithRoles.roles) {
        for (const rolePermission of userRole.role.permissions) {
          permissionsSet.add(rolePermission.permission.Name);
        }
      }

      userPermissions = Array.from(permissionsSet);

      // 将权限信息添加到请求对象中，方便后续使用
      user.permissions = userPermissions;
    }

    // 检查用户是否拥有任一所需权限
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasRequiredPermission) {
      const message = `用户缺少所需权限，需要: [${requiredPermissions.join(', ')}]，拥有: [${userPermissions.join(', ')}]`;
      this.logger.warn(message);
      throw new ForbiddenException('您没有执行此操作的权限');
    }

    return true;
  }
}
