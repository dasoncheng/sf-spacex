import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BatchCreateLicenseDto,
  CreateLicenseDto,
  LicenseDetailDto,
  LicenseResponseDto,
} from './dto/license.dto';
import { customAlphabet } from 'nanoid';

export const alphabet = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 34);

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  // Generate a license key of 34 characters
  private generateLicenseKey(): string {
    return alphabet();
  }

  async create(
    createLicenseDto: CreateLicenseDto,
  ): Promise<LicenseResponseDto> {
    const licenseKey = this.generateLicenseKey();

    const license = await this.prisma.license.create({
      data: {
        LicenseKey: licenseKey,
        ExpiresAt: createLicenseDto.ExpiresAt,
      },
    });

    return {
      ...license,
      ExpiresAt: license.ExpiresAt || undefined,
    };
  }

  async batchCreate(
    batchCreateDto: BatchCreateLicenseDto,
  ): Promise<LicenseResponseDto[]> {
    const licenses: LicenseResponseDto[] = [];

    // Create multiple licenses in a transaction
    await this.prisma.$transaction(async (prisma) => {
      for (let i = 0; i < batchCreateDto.count; i++) {
        const licenseKey = this.generateLicenseKey();
        const license = await prisma.license.create({
          data: {
            LicenseKey: licenseKey,
            ExpiresAt: batchCreateDto.ExpiresAt,
          },
        });
        licenses.push({
          ...license,
          ExpiresAt: license.ExpiresAt || undefined,
        });
      }
    });

    return licenses;
  }

  async findAll(): Promise<LicenseResponseDto[]> {
    const licenses = await this.prisma.license.findMany();
    return licenses.map((license) => ({
      ...license,
      ExpiresAt: license.ExpiresAt || undefined,
    }));
  }

  async findOne(id: string): Promise<LicenseDetailDto> {
    const license = await this.prisma.license.findUnique({
      where: { Id: id },
      include: {
        Activation: {
          include: {
            User: true,
            Application: true,
          },
        },
      },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    // Map to the expected format
    const result: LicenseDetailDto = {
      ...license,
      ExpiresAt: license.ExpiresAt || undefined,
      activation: license.Activation
        ? {
            Id: license.Activation.Id,
            Fingerprint: license.Activation.Fingerprint,
            ActivatedAt: license.Activation.ActivatedAt,
            ExpiresAt: license.Activation.ExpiresAt || undefined, // Convert null to undefined
            user: {
              Id: license.Activation.User.Id,
              Email: license.Activation.User.Email,
            },
            application: {
              Id: license.Activation.Application.Id,
              Name: license.Activation.Application.Name,
              AppKey: license.Activation.Application.AppKey,
            },
          }
        : undefined,
    };

    return result;
  }
}
