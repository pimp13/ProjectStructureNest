import { Module } from '@nestjs/common';
import { AdminPanelController } from './admin-panel.controller.js';
import { AdminPanelService } from './admin-panel.service.js';

@Module({
  imports: [],
  controllers: [AdminPanelController],
  providers: [AdminPanelService],
})
export class AdminPanelModule {}
