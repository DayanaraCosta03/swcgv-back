import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { CategoryProvider } from 'src/database/entities/category.typeorm.entity';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryProvider],
  exports: [CategoryService],
})
export class CategoryModule {}
