import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service.js';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'redis');
        const port = config.get<number>('REDIS_PORT', 6379);
        const password = config.get<string>('REDIS_PASSWORD');

        const auth = password ? `:${encodeURIComponent(password)}@` : '';
        const redisUrl = `redis://${auth}${host}:${port}`;

        console.log(`🔌 Connecting to Redis at ${host}:${port}`);

        return {
          stores: [createKeyv(redisUrl)],
          ttl: 24 * 60 * 60 * 1000,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
