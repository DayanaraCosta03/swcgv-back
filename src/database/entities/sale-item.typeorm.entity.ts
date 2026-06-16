import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';
import { ProductTypeOrmEntity } from './product.typeorm.entity';
import { SaleTypeOrmEntity } from './sale.typeorm.entity';

@Entity({ name: 'sale_item' })
export class SaleItemTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => ProductTypeOrmEntity, (product) => product.saleItems)
  @JoinColumn({ name: 'product_id' })
  product: ProductTypeOrmEntity;

  @OneToMany(() => SaleTypeOrmEntity, (sale) => sale.saleItems)
  @JoinColumn({ name: 'sale_id' })
  sale: SaleTypeOrmEntity;
}

export const SALE_ITEM_REPOSITORY = Symbol('SALE_ITEM');

export const SaleItemProvider: Provider = {
  provide: SALE_ITEM_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(SaleItemTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
