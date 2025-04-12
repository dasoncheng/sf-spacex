import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') ?? 'your-secret-key-here',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // 查询用户并包含角色和权限信息
    const user = await this.prisma.user.findUnique({
      where: { Id: payload.sub },
      include: {
        Roles: {
          include: {
            Role: {
              include: {
                Permissions: {
                  include: {
                    Permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // 提取用户所有角色及其权限
    const roleNames = user.Roles.map((ur) => ur.Role.Name);

    // 提取所有权限名称
    const permissions = new Set<string>();
    for (const userRole of user.Roles) {
      for (const rolePermission of userRole.Role.Permissions) {
        permissions.add(rolePermission.Permission.Name);
      }
    }

    // 返回用户信息，包括用户ID、角色和权限
    return {
      userId: user.Id,
      email: user.Email,
      roles: roleNames,
      permissions: Array.from(permissions),
    };
  }
}
