import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { genSalt, hash } from 'bcryptjs'; // Replace bcrypt with bcryptjs
import { omit } from 'lodash-es';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserDetailDto, UserResponseDto } from './dto/user.dto';

async function hashPassword(val: string) {
  const salt = await genSalt(10); // Generate salt with bcryptjs
  return await hash(val, salt); // Hash with bcryptjs
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Normalize input - handle both camelCase and PascalCase field names
    const email = createUserDto.email || createUserDto.Email;
    const password = createUserDto.password || createUserDto.Password;

    // Validation
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { Email: email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        Email: email,
        Password: hashedPassword,
      },
    });

    return omit(user, 'Password') as UserResponseDto;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => {
      return omit(user, 'Password') as UserResponseDto;
    });
  }

  async findOne(id: string): Promise<UserDetailDto> {
    const user = await this.prisma.user.findUnique({
      where: { Id: id },
      include: {
        Activations: {
          include: {
            Application: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Map activations to the expected format
    const applications = user.Activations.map((activation) => ({
      Id: activation.Application.Id,
      Name: activation.Application.Name,
      AppKey: activation.Application.AppKey,
      activatedAt: activation.ActivatedAt,
      expiresAt: activation.ExpiresAt,
    }));

    // 映射用户角色信息
    const roles = user.roles.map((userRole) => ({
      id: userRole.role.Id,
      name: userRole.role.Name,
      description: userRole.role.Description,
    }));

    return {
      ...omit(user, 'Password', 'roles'),
      applications,
      roles,
    } as UserDetailDto;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { Email: email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  /**
   * 为用户分配角色
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { Id: userId },
    });

    if (!user) {
      throw new NotFoundException(`用户不存在: ${userId}`);
    }

    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { Id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`角色不存在: ${roleId}`);
    }

    // 检查用户是否已拥有该角色
    const existingUserRole = await this.prisma.userRole.findFirst({
      where: {
        UserId: userId,
        RoleId: roleId,
      },
    });

    if (existingUserRole) {
      throw new ConflictException(`用户已拥有此角色`);
    }

    // 为用户分配角色
    await this.prisma.userRole.create({
      data: {
        UserId: userId,
        RoleId: roleId,
      },
    });
  }

  /**
   * 移除用户的角色
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { Id: userId },
    });

    if (!user) {
      throw new NotFoundException(`用户不存在: ${userId}`);
    }

    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { Id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`角色不存在: ${roleId}`);
    }

    // 检查用户是否拥有该角色
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        UserId: userId,
        RoleId: roleId,
      },
    });

    if (!userRole) {
      throw new BadRequestException(`用户未拥有此角色`);
    }

    // 移除用户角色
    await this.prisma.userRole.delete({
      where: {
        Id: userRole.Id,
      },
    });
  }

  /**
   * 获取用户所有的角色
   */
  async getUserRoles(userId: string): Promise<any[]> {
    const user = await this.prisma.user.findUnique({
      where: { Id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户不存在: ${userId}`);
    }

    return user.roles.map((userRole) => ({
      id: userRole.role.Id,
      name: userRole.role.Name,
      description: userRole.role.Description,
    }));
  }
}
