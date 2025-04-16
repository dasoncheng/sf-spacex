import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  ApplicationResponseDto,
  ApplicationDetailDto,
  ActivateCurrentUserDto,
  CheckCurrentUserActivationDto,
  ActivationStatusBoolDto,
} from './dto/application.dto';
import * as crypto from 'crypto';
import { ActivationResponseDto } from 'src/activations/dto/activation.dto';

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

  /**
   * Check if the current user has a valid activation for an application with specific fingerprint
   */
  async checkCurrentUserActivation(
    userId: string,
    checkDto: CheckCurrentUserActivationDto,
  ): Promise<ActivationStatusBoolDto> {
    // Check if application exists
    const application = await this.prisma.application.findUnique({
      where: { Id: checkDto.applicationId },
    });
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${checkDto.applicationId} not found`,
      );
    }

    // Find activation record for the current user with matching fingerprint
    const activation = await this.prisma.activation.findFirst({
      where: {
        UserId: userId,
        ApplicationId: checkDto.applicationId,
        Fingerprint: checkDto.fingerprint,
      },
    });

    // If no activation found, return false
    if (!activation) {
      return {
        isActive: false,
        ActivatedAt: null,
        ExpiresAt: null,
      };
    }

    const now = new Date();
    const expiresAt = activation.ExpiresAt;

    // If no expiration date or expiration date is in the future, it's valid
    const isActive = !expiresAt || expiresAt > now;

    return {
      isActive,
      ActivatedAt: activation.ActivatedAt,
      ExpiresAt: activation.ExpiresAt,
    };
  }

  /**
   * Activates the current user with the provided license key and fingerprint
   */
  async activateCurrentUser(
    userId: string,
    activateDto: ActivateCurrentUserDto,
  ) {
    // Check if application exists
    const application = await this.prisma.application.findUnique({
      where: { Id: activateDto.applicationId },
    });
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${activateDto.applicationId} not found`,
      );
    }

    // Check if license exists and is not used
    const license = await this.prisma.license.findUnique({
      where: { LicenseKey: activateDto.licenseKey },
    });
    if (!license) {
      throw new NotFoundException(
        `License with key ${activateDto.licenseKey} not found`,
      );
    }
    if (license.Status === 1) {
      throw new BadRequestException(
        `License with key ${activateDto.licenseKey} is already in use`,
      );
    }

    // Check if user already has an activation for this application
    const existingActivation = await this.prisma.activation.findFirst({
      where: {
        UserId: userId,
        ApplicationId: activateDto.applicationId,
      },
    });

    if (existingActivation) {
      throw new BadRequestException(
        `User already has an active license for this application`,
      );
    }

    // Calculate expiration date based on license's Duration (in days)
    let expiresAt: Date | null = null;
    if (license.Duration > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + license.Duration);
    }
    // If Duration is -1, it means permanent license (no expiry)

    // Create activation in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Mark license as used
      await prisma.license.update({
        where: { Id: license.Id },
        data: { Status: 1 }, // Set status to used
      });

      // Create activation
      return prisma.activation.create({
        data: {
          UserId: userId,
          ApplicationId: activateDto.applicationId,
          LicenseId: license.Id,
          Fingerprint: activateDto.fingerprint,
          ExpiresAt: expiresAt,
        },
      });
    });
  }
}
