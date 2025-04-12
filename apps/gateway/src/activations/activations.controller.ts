import { Body, Controller, Post } from '@nestjs/common';
import { ActivationsService } from './activations.service';
import {
  ActivationResponseDto,
  CreateActivationDto,
  ValidityCheckDto,
  ValidityResponseDto,
} from './dto/activation.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Permission } from '../auth/decorators/permission.decorator';

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
}
