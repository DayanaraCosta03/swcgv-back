import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { PurchaseProvider } from 'src/database/entities/purchase.typeorm.entity';

import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PurchaseController],
  providers: [PurchaseService, PurchaseProvider],
  exports: [PurchaseService],
})
export class PurchaseModule {}
