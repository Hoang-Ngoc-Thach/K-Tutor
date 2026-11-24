import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './core/transform.interceptor';
import { static as serveStatic } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(
    '/uploads',
    serveStatic(join(__dirname, '..', 'uploads'), {
      acceptRanges: true,
      dotfiles: 'deny',
      index: false,
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(configService.get<string>('PORT') ?? 3000);
}
bootstrap();
