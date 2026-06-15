import { Module } from '@nestjs/common';
import { ConfigModule, JwtModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { UserProvider } from 'src/database/entities/user.typeorm.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [DatabaseModule, JwtModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, UserProvider, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, JwtModule, ConfigModule],
})
export class AuthModule {}
