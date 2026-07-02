import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { DatabaseModule } from './database';
import { AuthModule } from './features/auth/auth.module';
import { CashRegisterModule } from './features/cash-register/cash-register.module';
import { CategoryModule } from './features/category/category.module';
import { ClientModule } from './features/client/client.module';
import { ProductModule } from './features/product/product.module';
import { PurchaseModule } from './features/purchase/purchase.module';
import { ReportModule } from './features/report/report.module';
import { SaleModule } from './features/sale/sale.module';
import { SupplierModule } from './features/supplier/supplier.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    ClientModule,
    SupplierModule,
    SaleModule,
    ReportModule,
    CashRegisterModule,
    PurchaseModule,
  ],
})
export class AppModule {}
