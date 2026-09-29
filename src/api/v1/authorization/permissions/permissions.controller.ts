import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PermissionsService } from './permissions.service.js';

@Controller({ path: 'permissions', version: '1' })
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.permissionsService.remove(id);
  }

  @Post(':permissionId/roles/:roleId')
  assignToRole(
    @Param('permissionId', ParseIntPipe)
    permissionId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.permissionsService.assignToRole(roleId, permissionId);
  }

  @Delete(':permissionId/roles/:roleId')
  removeFromRole(
    @Param('permissionId', ParseIntPipe)
    permissionId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.permissionsService.removeFromRole(roleId, permissionId);
  }
}
