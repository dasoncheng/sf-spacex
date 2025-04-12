import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  AssignPermissionDto,
  CreateRoleDto,
  RoleDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { Permission } from '../auth/decorators/permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permission('roles:create')
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permission('roles:read')
  async findAll(): Promise<RoleDto[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permission('roles:read')
  async findOne(@Param('id') id: string): Promise<RoleDto> {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @Permission('roles:update')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permission('roles:delete')
  async remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @Permission('roles:update')
  async assignPermission(
    @Param('id') id: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ): Promise<void> {
    return this.rolesService.assignPermission(
      id,
      assignPermissionDto.permissionId,
    );
  }

  @Delete(':id/permissions/:permissionId')
  @Permission('roles:update')
  async removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    return this.rolesService.removePermission(id, permissionId);
  }
}
