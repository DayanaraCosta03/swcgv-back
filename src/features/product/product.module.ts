import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { CategoryProvider } from 'src/database/entities/category.typeorm.entity';
import { ProductProvider } from 'src/database/entities/product.typeorm.entity';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProductController],
  providers: [ProductService, ProductProvider, CategoryProvider],
  exports: [ProductService],
})
export class ProductModule {}
