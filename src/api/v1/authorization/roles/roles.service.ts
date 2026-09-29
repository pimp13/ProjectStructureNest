import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },

      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: {
        id,
      },

      include: {
        permissions: {
          include: {
            permission: true,
          },
        },

        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);

    if (dto.name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    return this.prisma.role.update({
      where: {
        id,
      },

      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const usersCount = await this.prisma.user.count({
      where: {
        roleId: id,
      },
    });

    if (usersCount > 0) {
      throw new ConflictException('Cannot delete a role assigned to users');
    }

    return this.prisma.role.delete({
      where: {
        id,
      },
    });
  }

  async assignToUser(roleId: number, userId: number) {
    await this.findOne(roleId);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        roleId,
      },

      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });
  }
}
