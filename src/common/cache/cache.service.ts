import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * دریافت مقدار از کش
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  /**
   * ذخیره مقدار در کش
   * @param ttl زمان انقضا به میلی‌ثانیه (اختیاری)
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * حذف یک یا چند کلید
   */
  async del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      await Promise.all(key.map((k) => this.cacheManager.del(k)));
    } else {
      await this.cacheManager.del(key);
    }
  }

  /**
   * بررسی وجود کلید
   */
  async has(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== undefined && value !== null;
  }

  /**
   * مثل Laravel Cache::remember
   * اگر مقدار وجود داشت برمی‌گرداند، در غیر این صورت callback را اجرا و ذخیره می‌کند
   */
  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T> | T,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const result = await callback();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * مثل remember اما بدون انقضا (Forever)
   */
  async rememberForever<T>(
    key: string,
    callback: () => Promise<T> | T,
  ): Promise<T> {
    return this.remember(key, 0, callback); // 0 یعنی بدون انقضا (بسته به store)
  }

  /**
   * دریافت چند کلید همزمان
   */
  async getMany<T = any>(keys: string[]): Promise<(T | undefined)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }

  /**
   * ذخیره چند کلید همزمان
   */
  async setMany(
    entries: { key: string; value: any; ttl?: number }[],
  ): Promise<void> {
    await Promise.all(
      entries.map((entry) => this.set(entry.key, entry.value, entry.ttl)),
    );
  }

  /**
   * پاک کردن کل کش (مراقب باش!)
   */
  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * ساخت کلید با پیشوند (اختیاری اما حرفه‌ای)
   */
  buildKey(...parts: (string | number)[]): string {
    return parts.filter(Boolean).join(':');
  }
}
