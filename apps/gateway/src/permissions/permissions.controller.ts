import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  PermissionDto,
  UpdatePermissionDto,
} from './dto/permission.dto';
import { Permission } from '../auth/decorators/permission.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permission('permissions:create')
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionDto> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permission('permissions:read')
  async findAll(): Promise<PermissionDto[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permission('permissions:read')
  async findOne(@Param('id') id: string): Promise<PermissionDto> {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  @Permission('permissions:update')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionDto> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permission('permissions:delete')
  async remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
