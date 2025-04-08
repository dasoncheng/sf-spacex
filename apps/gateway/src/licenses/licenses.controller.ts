import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import {
  BatchCreateLicenseDto,
  CreateLicenseDto,
  LicenseDetailDto,
  LicenseResponseDto,
} from './dto/license.dto';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post()
  async create(
    @Body() createLicenseDto: CreateLicenseDto,
  ): Promise<LicenseResponseDto> {
    return this.licensesService.create(createLicenseDto);
  }

  @Post('batch')
  async batchCreate(
    @Body() batchCreateDto: BatchCreateLicenseDto,
  ): Promise<LicenseResponseDto[]> {
    return this.licensesService.batchCreate(batchCreateDto);
  }

  @Get()
  async findAll(): Promise<LicenseResponseDto[]> {
    return this.licensesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LicenseDetailDto> {
    return this.licensesService.findOne(id);
  }
}
