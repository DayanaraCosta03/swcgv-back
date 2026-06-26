import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';

import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
