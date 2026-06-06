import { Module } from '@nestjs/common';
import { JwtModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { UserProvider } from 'src/database/entities/user.typeorm.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, UserProvider],
})
export class AuthModule {}
