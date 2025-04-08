import {
  Injectable,
  ConflictException,
  NotFoundException,
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
    const existingUser = await this.prisma.user.findUnique({
      where: { Email: createUserDto.Email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await hashPassword(createUserDto.Password);

    const user = await this.prisma.user.create({
      data: {
        Email: createUserDto.Email,
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

    return {
      ...omit(user, 'Password'),
      applications,
    } as UserDetailDto;
  }
}
