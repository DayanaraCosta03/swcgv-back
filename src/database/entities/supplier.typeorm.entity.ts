import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';
import { PurchaseTypeOrmEntity } from './purchase.typeorm.entity';

@Entity({ name: 'supplier' })
export class SupplierTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => PurchaseTypeOrmEntity, (purchase) => purchase.supplier)
  purchases: PurchaseTypeOrmEntity[];
}

export const SUPPLIER_REPOSITORY = Symbol('SUPPLIER');

export const SupplierProvider: Provider = {
  provide: SUPPLIER_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(SupplierTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
