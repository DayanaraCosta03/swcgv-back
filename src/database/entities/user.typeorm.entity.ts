import { Provider } from '@nestjs/common';
import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MAIN_DATA_SOURCE } from '../database.provider';

@Entity({ name: 'user' })
export class UserTypeormEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '50' })
  name: string;

  @Column({ type: 'varchar', length: '255', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;
}

export const USER_REPOSITORY = Symbol('USER');

export const UserProvider: Provider = {
  provide: USER_REPOSITORY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getRepository(UserTypeormEntity),
  inject: [MAIN_DATA_SOURCE],
};
