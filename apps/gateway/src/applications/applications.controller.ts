import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  ApplicationResponseDto,
  ApplicationDetailDto,
} from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  async findAll(): Promise<ApplicationResponseDto[]> {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApplicationDetailDto> {
    return this.applicationsService.findOne(id);
  }
}
