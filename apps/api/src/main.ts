import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '');

  // Global prefix
  app.setGlobalPrefix('api');

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  const allowedOrigins = frontendUrl
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
  const corsOrigin =
    allowedOrigins.length === 0
      ? 'http://localhost:5173'
      : allowedOrigins.length === 1
        ? allowedOrigins[0]
        : allowedOrigins;

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('COMMUNE API')
      .setDescription('Community Operating System — API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 COMMUNE API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
