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

/** Métodos de pago aceptados en el vivero. */
export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA';

/** Tipo de comprobante que se emite por la venta. */
export type DocumentType = 'BOLETA' | 'FACTURA' | 'TICKET';

@Entity({ name: 'sale' })
export class SaleTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  saleDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

// Método de pago. `default` evita nulls en filas antiguas al sincronizar.
  @Column({ type: 'varchar', length: 20, default: 'EFECTIVO' })
  paymentMethod: PaymentMethod;

  // Tipo de comprobante emitido (boleta / factura / ticket).
  @Column({ type: 'varchar', length: 20, default: 'TICKET' })
  documentType: DocumentType;

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
