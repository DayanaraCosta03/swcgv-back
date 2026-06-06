import { Provider } from '@nestjs/common';
import {
  Column,
  DataSource,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';
import { SaleTypeOrmEntity } from './sale.typeorm.entity';

@Entity({ name: 'client' })
export class ClientTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '255' })
  name: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: '255', nullable: true })
  notes?: string;

  @OneToMany(() => SaleTypeOrmEntity, (sale) => sale.client)
  sales: SaleTypeOrmEntity[];
}

export const CLIENT_REPOSITORY = Symbol('CLIENT');

export const ClientProvider: Provider = {
  provide: CLIENT_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(ClientTypeOrmEntity),
  inject: [MAIN_DATA_SOURCE],
};
