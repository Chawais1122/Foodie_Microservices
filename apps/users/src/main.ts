import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UsersModule);
  const configService = app.get(ConfigService);
  app.enableCors({ origin: '*', credentials: true });

  await app.listen(Number(configService.get('USER_SERVICE_PORT')) || 4222);
}
bootstrap();
