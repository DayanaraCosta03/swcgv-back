import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { DatabaseModule } from './database';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule],
})
export class AppModule {}
