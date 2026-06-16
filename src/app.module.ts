import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { DatabaseModule } from './database';
import { AuthModule } from './features/auth/auth.module';
import { CategoryModule } from './features/category/category.module';
import { ProductModule } from './features/product/product.module';
import { ClientModule } from './features/client/client.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    ClientModule,
  ],
})
export class AppModule {}
