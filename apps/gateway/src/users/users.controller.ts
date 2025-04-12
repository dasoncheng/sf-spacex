import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserDetailDto, UserResponseDto } from './dto/user.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permission('users:read')
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permission('users:read')
  async findOne(@Param('id') id: string): Promise<UserDetailDto> {
    return this.usersService.findOne(id);
  }

  @Get(':id/roles')
  @Permission('users:read')
  async getUserRoles(@Param('id') userId: string) {
    return this.usersService.getUserRoles(userId);
  }

  @Post(':id/roles/:roleId')
  @Permission('users:update')
  async assignRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.usersService.assignRole(userId, roleId);
    return { message: '角色分配成功' };
  }

  @Delete(':id/roles/:roleId')
  @Permission('users:update')
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.usersService.removeRole(userId, roleId);
    return { message: '角色移除成功' };
  }
}
