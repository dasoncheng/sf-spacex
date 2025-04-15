import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  ApplicationResponseDto,
  ApplicationDetailDto,
} from './dto/application.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import {
  ActivateCurrentUserDto,
  ActivationStatusBoolDto,
  CheckCurrentUserActivationDto,
} from './dto/application.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Permission('applications:create')
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  @Permission('applications:read')
  async findAll(): Promise<ApplicationResponseDto[]> {
    return this.applicationsService.findAll();
  }

  @Get('activate')
  async checkCurrentUserActivation(
    @User('userId') userId: string,
    @Query() checkDto: CheckCurrentUserActivationDto,
  ): Promise<ActivationStatusBoolDto> {
    return this.applicationsService.checkCurrentUserActivation(
      userId,
      checkDto,
    );
  }

  @Get(':id')
  @Permission('applications:read')
  async findOne(@Param('id') id: string): Promise<ApplicationDetailDto> {
    return this.applicationsService.findOne(id);
  }

  @Post('activate')
  async activateCurrentUser(
    @User('userId') userId: string,
    @Body() activateDto: ActivateCurrentUserDto,
  ) {
    return this.applicationsService.activateCurrentUser(userId, activateDto);
  }
}
