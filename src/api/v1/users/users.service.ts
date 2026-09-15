import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await callback();
    await this.cacheManager.set(key, result, ttl);
    return result;
  }

  async findAll() {
    const cacheKey = 'users.list';
    const cachedUsers = await this.cacheManager.get(cacheKey);
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set(cacheKey, users, 24 * 60 * 60 * 1000);

    return users;
    // await this.cacheManager.del('users.list');
    // return 'cache clear';
  }

  async findById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
