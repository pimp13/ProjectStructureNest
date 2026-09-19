import { NestFactory } from '@nestjs/core';
import { AdminPanelModule } from './admin-panel.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AdminPanelModule);
  await app.listen(3001);
}
await bootstrap();
