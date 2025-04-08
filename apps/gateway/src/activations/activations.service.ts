import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivationResponseDto, CreateActivationDto, ValidityCheckDto, ValidityResponseDto } from './dto/activation.dto';

@Injectable()
export class ActivationsService {
  constructor(private prisma: PrismaService) {}

  async create(createActivationDto: CreateActivationDto): Promise<ActivationResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { Id: createActivationDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createActivationDto.userId} not found`);
    }

    // Check if application exists
    const application = await this.prisma.application.findUnique({
      where: { Id: createActivationDto.applicationId },
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${createActivationDto.applicationId} not found`);
    }

    // Check if license exists and is not used
    const license = await this.prisma.license.findUnique({
      where: { LicenseKey: createActivationDto.licenseKey },
    });
    if (!license) {
      throw new NotFoundException(`License with key ${createActivationDto.licenseKey} not found`);
    }
    if (license.IsUsed) {
      throw new BadRequestException(`License with key ${createActivationDto.licenseKey} is already in use`);
    }

    // Calculate expiration date based on license's ExpiresAt (duration in seconds)
    const expiresAt = license.ExpiresAt
      ? new Date(Date.now() + license.ExpiresAt * 1000)
      : null;

    // Create activation in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Mark license as used
      await prisma.license.update({
        where: { Id: license.Id },
        data: { IsUsed: true },
      });

      // Create activation
      return prisma.activation.create({
        data: {
          UserId: createActivationDto.userId,
          ApplicationId: createActivationDto.applicationId,
          LicenseId: license.Id,
          Fingerprint: createActivationDto.fingerprint,
          ExpiresAt: expiresAt,
        },
      });
    });

    return result;
  }

  async checkValidity(checkDto: ValidityCheckDto): Promise<ValidityResponseDto> {
    const activation = await this.prisma.activation.findFirst({
      where: {
        UserId: checkDto.userId,
        ApplicationId: checkDto.applicationId,
      },
    });

    if (!activation) {
      return { isValid: false };
    }

    const now = new Date();
    const expiresAt = activation.ExpiresAt;

    // If no expiration date or expiration date is in the future, it's valid
    const isValid = !expiresAt || expiresAt > now;

    // Calculate remaining time in seconds
    const remainingSeconds = expiresAt
      ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      : null;

    return {
      isValid,
      expiresAt: expiresAt || undefined,
      remainingSeconds: isValid && remainingSeconds ? remainingSeconds : undefined,
    };
  }
}
