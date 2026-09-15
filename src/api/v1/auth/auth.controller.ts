import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './auth.guard.js';

@ApiTags()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Body() bodyData: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      bodyData.email,
      bodyData.password,
    );
    const result = await this.authService.login(user);

    const cookieName =
      this.configService.getOrThrow<string>('AUTH_COOKIE_NAME');
    const cookieTtl = this.configService.getOrThrow<number>('AUTH_COOKIE_TTL');

    response.cookie(cookieName, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: cookieTtl * 60 * 1000,
      path: '/',
    });
    return {
      ok: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        user: result.user,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: any) {
    return {
      success: true,
      data: {
        user: request.user,
      },
    };
  }
}
