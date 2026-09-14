import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('main')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
