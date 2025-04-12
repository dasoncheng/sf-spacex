import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionGuard } from './permission.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class AppGuard implements CanActivate {
  private readonly logger = new Logger(AppGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtAuthGuard: JwtAuthGuard,
    private permissionGuard: PermissionGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      // 先进行JWT认证
      const canActivateJwt = await this.jwtAuthGuard.canActivate(context);
      if (!canActivateJwt) {
        throw new UnauthorizedException('身份验证失败');
      }

      // 检查是否需要权限验证
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

      // 如果没有指定权限要求，直接通过认证
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      // 进行权限验证
      const hasPermission = await this.permissionGuard.canActivate(context);
      if (!hasPermission) {
        throw new ForbiddenException('您没有执行此操作的权限');
      }

      return true;
    } catch (error) {
      // 如果是已知类型的错误，直接抛出
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // 记录意外错误
      this.logger.error(
        `认证或授权过程中出现意外错误: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('认证失败');
    }
  }
}
