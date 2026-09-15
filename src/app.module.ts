import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './api/v1/auth/auth.module.js';
import { UsersModule } from './api/v1/users/users.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true, // تا در همه ماژول‌ها در دسترس باشد
      useFactory: async () => {
        return {
          stores: [
            createKeyv('redis://localhost:6379'), // آدرس Redis
          ],
          ttl: 24 * 60 * 60 * 1000, // زمان پیش‌فرض کش (میلی‌ثانیه) - اینجا ۱ ساعت
        };
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
