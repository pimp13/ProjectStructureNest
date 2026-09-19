import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CacheService } from '../../../common/cache/cache.service.js';
import { PrismaService } from '@app/prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const cacheKey = 'users.list';
    const cachedUsers = await this.cacheService.get(cacheKey);
    if (cachedUsers) {
      console.log('Get Data from redis...');
      return cachedUsers;
    }

    console.log('Get Data from DB...');
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheService.set(cacheKey, users, 24 * 60 * 60 * 1000);

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
