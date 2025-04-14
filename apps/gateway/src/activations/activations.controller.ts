import { Body, Controller, Post } from '@nestjs/common';
import { ActivationsService } from './activations.service';
import {
  ActivationResponseDto,
  ActivationStatusBoolDto,
  CheckCurrentUserActivationDto,
  CreateActivationDto,
  ValidityCheckDto,
  ValidityResponseDto,
} from './dto/activation.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Permission } from '../auth/decorators/permission.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('activations')
export class ActivationsController {
  constructor(private readonly activationsService: ActivationsService) {}

  @Post()
  @Permission('activations:create')
  async create(
    @Body() createActivationDto: CreateActivationDto,
  ): Promise<ActivationResponseDto> {
    return this.activationsService.create(createActivationDto);
  }

  @Public()
  @Post('check')
  async checkValidity(
    @Body() checkDto: ValidityCheckDto,
  ): Promise<ValidityResponseDto> {
    return this.activationsService.checkValidity(checkDto);
  }

  @Post('status')
  async checkCurrentUserActivation(
    @User('Id') userId: string,
    @Body() checkDto: CheckCurrentUserActivationDto,
  ): Promise<ActivationStatusBoolDto> {
    return this.activationsService.checkCurrentUserActivation(userId, checkDto);
  }
}
