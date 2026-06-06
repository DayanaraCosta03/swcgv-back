import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';
import { PurchaseItemTypeOrmEntity } from './purchase-item.typeorm.entity';
import { SupplierTypeOrmEntity } from './supplier.typeorm.entity';

@Entity({ name: 'purchase' })
export class PurchaseTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => SupplierTypeOrmEntity, (supplier) => supplier.purchases)
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierTypeOrmEntity;

  @OneToMany(
    () => PurchaseItemTypeOrmEntity,
    (purchaseItem) => purchaseItem.purchase,
  )
  purchaseItems: PurchaseItemTypeOrmEntity[];
}

export const PURCHASE_REPOSITORY = Symbol('PURCHASE');

export const PurchaseProvider: Provider = {
  provide: PURCHASE_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(PurchaseTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
