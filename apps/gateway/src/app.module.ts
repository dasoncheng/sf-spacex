import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { LicensesModule } from './licenses/licenses.module';
import { ActivationsModule } from './activations/activations.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ApplicationsModule,
    LicensesModule,
    ActivationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
