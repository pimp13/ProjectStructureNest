import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Permission already exists');
    }

    return this.prisma.permission.create({
      data: {
        name: dto.name,
        resource: dto.resource,
        action: dto.action,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [
        {
          resource: 'asc',
        },
        {
          action: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: {
        id,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(id: number, dto: UpdatePermissionDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.permission.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Permission name already exists');
      }
    }

    return this.prisma.permission.update({
      where: {
        id,
      },

      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.resource !== undefined && {
          resource: dto.resource,
        }),

        ...(dto.action !== undefined && {
          action: dto.action,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.permission.delete({
      where: {
        id,
      },
    });
  }

  async assignToRole(roleId: number, permissionId: number) {
    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        id: permissionId,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },

      update: {},

      create: {
        roleId,
        permissionId,
      },
    });
  }

  async removeFromRole(roleId: number, permissionId: number) {
    const relation = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!relation) {
      throw new NotFoundException('Permission is not assigned to this role');
    }

    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }
}
