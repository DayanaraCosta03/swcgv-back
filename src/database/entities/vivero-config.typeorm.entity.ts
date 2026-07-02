import { Provider } from '@nestjs/common';
import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';

/**
 * Configuración del negocio (diseño Figma "Configuración"). Es una fila única:
 * el servicio garantiza que exista una sola. Sus datos se imprimen en el ticket.
 */
@Entity({ name: 'vivero_config' })
export class ViveroConfigTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_name', type: 'varchar', length: 150, default: '' })
  businessName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;
}

export const VIVERO_CONFIG_REPOSITORY = Symbol('VIVERO_CONFIG');

export const ViveroConfigProvider: Provider = {
  provide: VIVERO_CONFIG_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(ViveroConfigTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
