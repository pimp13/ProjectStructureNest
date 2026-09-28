import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ResponseWrapperInterceptor } from './common/response-wrapper/response-wrapper.interceptor.js';
import { HttpExceptionFilter } from './common/http-exception/http-exception.filter.js';

type CorsOptions = {
  origin?: string | string[];
  methods?: string | string[];
  allowedHeaders?: string | string[];
  credentials?: boolean;
};

function enableCors(app: INestApplication, options?: CorsOptions) {
  const defaultOrigins = ['http://localhost:4200', 'https://your-frontend.com'];

  const defaultMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

  const defaultAllowedHeaders = ['Content-Type', 'Authorization'];

  const toArray = (value?: string | string[]): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const origin = [...defaultOrigins, ...toArray(options?.origin)];
  const methods = [...defaultMethods, ...toArray(options?.methods)];
  const allowedHeaders = [
    ...defaultAllowedHeaders,
    ...toArray(options?.allowedHeaders),
  ];

  app.enableCors({
    origin,
    methods,
    allowedHeaders,
    credentials: options?.credentials ?? true,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  enableCors(app, {
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:4000'),
  });

  app.useGlobalInterceptors(new ResponseWrapperInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

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

  const port = configService.get<number>('PORT', 5000);
  console.log(`Server is running on ${port}`);
  await app.listen(port);
}
await bootstrap();
