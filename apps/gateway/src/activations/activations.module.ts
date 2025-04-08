import { Module } from '@nestjs/common';
import { ActivationsController } from './activations.controller';
import { ActivationsService } from './activations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivationsController],
  providers: [ActivationsService],
})
export class ActivationsModule {}
