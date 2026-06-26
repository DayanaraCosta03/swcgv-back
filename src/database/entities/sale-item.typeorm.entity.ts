import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';
import { ProductTypeOrmEntity } from './product.typeorm.entity';
import { SaleTypeOrmEntity } from './sale.typeorm.entity';

/** Métodos de pago aceptados en el vivero. */
export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA';

/** Tipo de comprobante que se emite por la venta. */
export type DocumentType = 'BOLETA' | 'FACTURA' | 'TICKET';

@Entity({ name: 'sale_item' })
export class SaleItemTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

// Método de pago. `default` evita nulls en filas antiguas al sincronizar.
  @Column({ type: 'varchar', length: 20, default: 'EFECTIVO' })
  paymentMethod: PaymentMethod;

// Tipo de comprobante emitido (boleta / factura / ticket).
  @Column({ type: 'varchar', length: 20, default: 'TICKET' })
  documentType: DocumentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => ProductTypeOrmEntity, (product) => product.saleItems)
  @JoinColumn({ name: 'product_id' })
  product: ProductTypeOrmEntity;

  @ManyToOne(() => SaleTypeOrmEntity, (sale) => sale.saleItems)
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
