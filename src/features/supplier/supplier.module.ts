import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { AuthModule } from '../auth/auth.module';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierProvider } from 'src/database/entities/supplier.typeorm.entity';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SupplierController],
  providers: [SupplierService, SupplierProvider],
  exports: [SupplierService],
})
export class SupplierModule {}
