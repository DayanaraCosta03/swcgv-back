import { Provider } from '@nestjs/common';
import { DatabaseConfigService } from 'src/config';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export const MAIN_DATA_SOURCE = Symbol('MAIN_DATA_SOURCE');

export const databaseProviders: Provider[] = [
  {
    provide: MAIN_DATA_SOURCE,
    inject: [DatabaseConfigService],
    useFactory: async (configService: DatabaseConfigService) => {
      const config = configService.MAIN_DATABASE_SOURCE;

      const dataSource = new DataSource({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        entities: [__dirname + '/../**/*.typeorm.entity{.ts,.js}'],
        ssl:
          config.ssl === true
            ? {
                rejectUnauthorized: true,
                ca: fs
                  .readFileSync(path.join(__dirname, '..', '..', 'ca.pem'))
                  .toString(),
              }
            : undefined,
        synchronize: config.synchronize,
      });

      return dataSource.initialize();
    },
  },
];
