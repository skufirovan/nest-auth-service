import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Recaptcha } from '@nestlab/google-recaptcha'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ProviderGuard } from './guards/provider.guard'
import { ProviderService } from './provider/provider.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService
  ) {}

  @Recaptcha()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Recaptcha()
  @Post('login')
  async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.authService.login(req, dto)
  }

  @UseGuards(ProviderGuard)
  @Get('oauth/callback/:provider')
  async callback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('code') code: string,
    @Param('provider') provider: string
  ) {
    if (!code) {
      throw new BadRequestException('Код авторизации не был предоставлен.')
    }

    await this.authService.extractProfileFromCode(req, provider, code)

    return res.redirect(`${this.configService.getOrThrow('ALLOWED_ORIGIN')}`)
  }

  @UseGuards(ProviderGuard)
  @Get('oauth/connect/:provider')
  public async connect(@Param('provider') provider: string) {
    const providerInstance = this.providerService.findByService(provider)

    return {
      url: providerInstance?.getAuthUrl(),
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res)
  }
}
