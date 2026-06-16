import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';
import { AuthModule } from '../auth/auth.module';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { ClientProvider } from 'src/database/entities/client.typeorm.entity';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ClientController],
  providers: [ClientService, ClientProvider],
  exports: [ClientService],
})
export class ClientModule {}
