import { Module } from '@nestjs/common';
import { ConfigModule as NestJsConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { appConfigSchema, AppConfigService } from './app';
import { databaseConfigSchema, DatabaseConfigService } from './database';
import { HttpConfigService } from './http';
import { securityConfigSchema, SecurityConfigService } from './security';

@Module({
  imports: [
    NestJsConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        ...appConfigSchema,
        ...databaseConfigSchema,
        ...securityConfigSchema,
      }),
    }),
  ],
  providers: [
    AppConfigService,
    DatabaseConfigService,
    HttpConfigService,
    SecurityConfigService,
  ],
  exports: [
    AppConfigService,
    DatabaseConfigService,
    HttpConfigService,
    SecurityConfigService,
  ],
})
export class ConfigModule {}
