import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service.js';

@Global() // تا در همه جا قابل استفاده باشد
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        stores: [createKeyv(process.env.REDIS_URL || 'redis://localhost:6379')],
        ttl: 24 * 60 * 60 * 1000, // 24H for default
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
