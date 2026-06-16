import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CategoryTypeOrmEntity } from './category.typeorm.entity';
import { MAIN_DATA_SOURCE } from '../database.provider';
import { PurchaseItemTypeOrmEntity } from './purchase-item.typeorm.entity';
import { SaleItemTypeOrmEntity } from './sale-item.typeorm.entity';

@Entity({ name: 'product' })
export class ProductTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '200' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  stock: number;

  @Column({ type: 'varchar' })
  imageUrl: string;

  @Column({ type: 'integer' })
  categoryId: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => CategoryTypeOrmEntity, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryTypeOrmEntity;

  @OneToMany(() => SaleItemTypeOrmEntity, (saleItem) => saleItem.product)
  saleItems: SaleItemTypeOrmEntity[];

  @OneToMany(
    () => PurchaseItemTypeOrmEntity,
    (purchaseItem) => purchaseItem.product,
  )
  purchaseItems: PurchaseItemTypeOrmEntity[];
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT');

export const ProductProvider: Provider = {
  provide: PRODUCT_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(ProductTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
