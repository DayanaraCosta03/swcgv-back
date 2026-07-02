import { Provider } from '@nestjs/common';
import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';

/** Estado de la caja: abierta o cerrada. */
export type CashRegisterStatus = 'OPEN' | 'CLOSED';

/**
 * Sesión de caja de un usuario (diseño Figma "Caja").
 * Se abre con un monto inicial y se cierra declarando el monto final; al cerrar
 * se calcula el monto esperado (inicial + ventas en efectivo desde la apertura)
 * y la diferencia del arqueo (final - esperado).
 */
@Entity({ name: 'cash_register' })
export class CashRegisterTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Usuario que abrió la caja. Ver nota de arqueo en el servicio. */
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'opened_at', type: 'timestamp' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'initial_amount', type: 'decimal', precision: 10, scale: 2 })
  initialAmount: number;

  @Column({
    name: 'final_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  finalAmount: number | null;

  /** Monto esperado en caja al cerrar: inicial + ventas en efectivo. */
  @Column({
    name: 'expected_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  expectedAmount: number | null;

  /** Arqueo: finalAmount - expectedAmount. Negativo = faltante, positivo = sobrante. */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  difference: number | null;

  @Column({ type: 'varchar', length: 10, default: 'OPEN' })
  status: CashRegisterStatus;
}

export const CASH_REGISTER_REPOSITORY = Symbol('CASH_REGISTER');

export const CashRegisterProvider: Provider = {
  provide: CASH_REGISTER_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(CashRegisterTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
