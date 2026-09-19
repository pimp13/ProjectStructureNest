import { PrismaService } from '@app/prisma/prisma.service.js';
import { Injectable } from '@nestjs/common';
import cowsay from 'cowsay';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    const result = await this.prisma.user.findMany({
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result,
      cowsay: cowsay.say({
        text: "I'm a js moooodule",
        e: 'oO',
        T: 'U ',
      }),
    };
  }
}
