import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { CashRegisterProvider } from 'src/database/entities/cash-register.typeorm.entity';
import { SaleProvider } from 'src/database/entities/sale.typeorm.entity';

import { CashRegisterController } from './cash-register.controller';
import { CashRegisterService } from './cash-register.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CashRegisterController],
  providers: [CashRegisterService, CashRegisterProvider, SaleProvider],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
