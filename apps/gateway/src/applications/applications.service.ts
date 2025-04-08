import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  ApplicationResponseDto,
  ApplicationDetailDto,
} from './dto/application.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    // Generate a random app key
    const appKey = crypto.randomBytes(16).toString('hex');

    const application = await this.prisma.application.create({
      data: {
        Name: createApplicationDto.Name,
        Description: createApplicationDto.Description,
        AppKey: appKey,
      },
    });

    return application;
  }

  async findAll(): Promise<ApplicationResponseDto[]> {
    return this.prisma.application.findMany();
  }

  async findOne(id: string): Promise<ApplicationDetailDto> {
    const application = await this.prisma.application.findUnique({
      where: { Id: id },
      include: {
        Activation: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Map activations to expected users format
    const users = application.Activation.map((activation) => ({
      Id: activation.User.Id,
      Email: activation.User.Email,
      activatedAt: activation.ActivatedAt,
      expiresAt: activation.ExpiresAt,
    }));

    return {
      ...application,
      users,
    };
  }
}
