import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import {
  BatchCreateLicenseDto,
  CreateLicenseDto,
  LicenseDetailDto,
  LicenseResponseDto,
} from './dto/license.dto';
import { Permission } from '../auth/decorators/permission.decorator';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post()
  @Permission('licenses:create')
  async create(
    @Body() createLicenseDto: CreateLicenseDto,
  ): Promise<LicenseResponseDto> {
    return this.licensesService.create(createLicenseDto);
  }

  @Post('batch')
  @Permission('licenses:create')
  async batchCreate(
    @Body() batchCreateDto: BatchCreateLicenseDto,
  ): Promise<LicenseResponseDto[]> {
    return this.licensesService.batchCreate(batchCreateDto);
  }

  @Get()
  @Permission('licenses:read')
  async findAll(): Promise<LicenseResponseDto[]> {
    return this.licensesService.findAll();
  }

  @Get(':id')
  @Permission('licenses:read')
  async findOne(@Param('id') id: string): Promise<LicenseDetailDto> {
    return this.licensesService.findOne(id);
  }
}
