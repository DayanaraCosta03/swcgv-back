import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { ClientProvider } from 'src/database/entities/client.typeorm.entity';
import { ProductProvider } from 'src/database/entities/product.typeorm.entity';
import { SaleItemProvider } from 'src/database/entities/sale-item.typeorm.entity';
import { SaleProvider } from 'src/database/entities/sale.typeorm.entity';

import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SaleController],
  providers: [
    SaleService,
    SaleProvider,
    SaleItemProvider,
    ProductProvider,
    ClientProvider,
  ],
  exports: [SaleService],
})
export class SaleModule {}
