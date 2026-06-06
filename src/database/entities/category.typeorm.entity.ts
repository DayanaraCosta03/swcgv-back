import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductTypeOrmEntity } from './product.typeorm.entity';
import { MAIN_DATA_SOURCE } from '../database.provider';

@Entity({ name: 'category' })
export class CategoryTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '50' })
  name: string;

  @OneToMany(() => ProductTypeOrmEntity, (product) => product.category)
  products: ProductTypeOrmEntity[];
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY');

export const CategoryProvider: Provider = {
  provide: CATEGORY_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(CategoryTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
