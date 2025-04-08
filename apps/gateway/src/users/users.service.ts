import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserDetailDto, UserResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { Email: createUserDto.Email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.Password, 10);

    const user = await this.prisma.user.create({
      data: {
        Email: createUserDto.Email,
        Password: hashedPassword,
      },
    });

    const { Password, ...result } = user;
    return result as UserResponseDto;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map(user => {
      const { Password, ...result } = user;
      return result as UserResponseDto;
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
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { Password, ...userWithoutPassword } = user;

    // Map activations to the expected format
    const applications = user.Activations.map(activation => ({
      Id: activation.Application.Id,
      Name: activation.Application.Name,
      AppKey: activation.Application.AppKey,
      activatedAt: activation.ActivatedAt,
      expiresAt: activation.ExpiresAt,
    }));

    return {
      ...userWithoutPassword,
      applications,
    } as UserDetailDto;
  }
}
