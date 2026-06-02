import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookie from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {
  AppConfigService,
  HttpConfigService,
  SecurityConfigService,
} from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(AppConfigService);
  const securityConfig = app.get(SecurityConfigService);
  const httpConfig = app.get(HttpConfigService);

  app.use(
    helmet({
      contentSecurityPolicy: securityConfig.CONTENT_SECURITY_POLICY,
    }),
  );

  app.setGlobalPrefix(httpConfig.GLOBAL_PREFIX);

  app.enableCors({
    origin: securityConfig.CORS_ORIGINS,
    credentials: securityConfig.CORS_CREDENTIALS,
    methods: securityConfig.CORS_METHODS,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookie(securityConfig.COOKIE_KEY));

  await app.listen(appConfig.PORT);
}

const handleError = (error: unknown) => {
  console.error(error);
  process.exit(1);
};

bootstrap().catch(handleError);

process.on('uncaughtException', handleError);
