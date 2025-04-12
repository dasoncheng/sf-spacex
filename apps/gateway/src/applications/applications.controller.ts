import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  ApplicationResponseDto,
  ApplicationDetailDto,
} from './dto/application.dto';
import { Permission } from '../auth/decorators/permission.decorator';

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

  @Get(':id')
  @Permission('applications:read')
  async findOne(@Param('id') id: string): Promise<ApplicationDetailDto> {
    return this.applicationsService.findOne(id);
  }
}
