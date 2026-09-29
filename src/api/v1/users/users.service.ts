import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CacheService } from '../../../common/cache/cache.service.js';
import * as bcrypt from 'bcrypt';
import { User, UserRoleEnum } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async create(bodyData: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(bodyData.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: bodyData.email,
        password: hashedPassword,
        username: bodyData.username,
        isActive: bodyData.isActive,
        name: bodyData.name,
        role: UserRoleEnum.user,
        meta: bodyData.meta ?? undefined,
      },
    });

    return user;
  }

  async findAll() {
    // const cacheKey = 'users.list';
    // const cachedUsers = await this.cacheService.get(cacheKey);
    // if (cachedUsers) {
    //   console.log('** Get Data from redis **...');
    //   return cachedUsers;
    // }

    console.log('Get Data from DB...');
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // await this.cacheService.set(cacheKey, users, 24 * 60 * 60 * 1000);

    return users;
    // await this.cacheManager.del('users.list');
    // return 'cache clear';
  }

  async findById(id: number) {
    // const cacheKey = `users.by-id.${id}`;
    // const cachedUser = await this.cacheService.get<User | null>(cacheKey);
    // if (cachedUser) {
    //   console.log('** Get Data from redis **');
    //   return cachedUser;
    // }
    // console.log('Get Data from DB...');

    const userData = await this.prisma.user.findUnique({
      where: { id },
    });
    // await this.cacheService.set<User | null>(
    //   cacheKey,
    //   userData,
    //   24 * 60 * 60 * 1000,
    // );

    return userData;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async isEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    return Boolean(user);
  }

  async update(id: number, bodyData: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: bodyData.isActive ?? true,
        meta: bodyData.meta ?? undefined,
        email: bodyData.email,
        name: bodyData.name ?? null,
        username: bodyData.username,
        updatedAt: new Date(),
        role: 'user',
      },
    });

    return { user };
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
    return true;
  }
}
