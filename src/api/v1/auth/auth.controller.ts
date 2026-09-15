import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
