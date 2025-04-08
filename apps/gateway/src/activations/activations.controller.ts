import { Body, Controller, Post } from '@nestjs/common';
import { ActivationsService } from './activations.service';
import {
  ActivationResponseDto,
  CreateActivationDto,
  ValidityCheckDto,
  ValidityResponseDto,
} from './dto/activation.dto';

@Controller('activations')
export class ActivationsController {
  constructor(private readonly activationsService: ActivationsService) {}

  @Post()
  async create(
    @Body() createActivationDto: CreateActivationDto,
  ): Promise<ActivationResponseDto> {
    return this.activationsService.create(createActivationDto);
  }

  @Post('check')
  async checkValidity(
    @Body() checkDto: ValidityCheckDto,
  ): Promise<ValidityResponseDto> {
    return this.activationsService.checkValidity(checkDto);
  }
}
