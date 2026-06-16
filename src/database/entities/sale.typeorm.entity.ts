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

import { MAIN_DATA_SOURCE } from '../database.provider';
import { ClientTypeOrmEntity } from './client.typeorm.entity';
import { SaleItemTypeOrmEntity } from './sale-item.typeorm.entity';

@Entity({ name: 'sale' })
export class SaleTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  saleDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => ClientTypeOrmEntity, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: ClientTypeOrmEntity;

  @OneToMany(() => SaleItemTypeOrmEntity, (saleItem) => saleItem.sale)
  saleItems: SaleItemTypeOrmEntity[];
}

export const SALE_REPOSITORY = Symbol('SALE');

export const SaleProvider: Provider = {
  provide: SALE_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(SaleTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
