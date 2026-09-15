import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('API_PREFIX', 'api'), {
    // exclude: [
    //   { path: 'health', method: RequestMethod.GET },
    //   { path: 'docs', method: RequestMethod.GET },
    //   'metrics', // همه متدهای این مسیر
    // ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    // prefix: 'v', // پیش‌فرض همین است (اختیاری)
  });

  const config = new DocumentBuilder()
    .setTitle('MY API')
    .setDescription('My NestJS API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    configService.get<string>('API_DOC_URL', 'docs'),
    app,
    document,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // فیلدهای اضافی که در DTO تعریف نشده‌اند را حذف می‌کند
      forbidNonWhitelisted: true, // اگر فیلد اضافی ارسال شود، خطا می‌دهد
      transform: true, // تبدیل خودکار نوع داده‌ها (مثلاً string به number)
      transformOptions: {
        enableImplicitConversion: true, // تبدیل ضمنی نوع‌ها
      },
    }),
  );

  app.use(cookieParser());

  const port = configService.get<number>('APP_PORT', 5000);
  console.log(`Server is running on ${port}`);
  await app.listen(port);
}
await bootstrap();
