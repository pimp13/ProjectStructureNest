import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';

@Module({
  imports: [RolesModule, PermissionsModule]
})
export class AuthorizationModule {}
