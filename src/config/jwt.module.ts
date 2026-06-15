import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { ConfigModule } from './config.module';
import { SecurityConfigService } from './security';

@Module({
  imports: [
    ConfigModule,
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (securityService: SecurityConfigService) => ({
        global: true,
        secret: securityService.JWT_ACCESS_TOKEN_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
      inject: [SecurityConfigService],
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
