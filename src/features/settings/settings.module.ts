import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { ViveroConfigProvider } from 'src/database/entities/vivero-config.typeorm.entity';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService, ViveroConfigProvider],
  exports: [SettingsService],
})
export class SettingsModule {}
