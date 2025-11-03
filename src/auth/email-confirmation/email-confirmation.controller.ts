import { Body, Controller, Post, Req } from '@nestjs/common'
import type { Request } from 'express'

import { ConfirmationDto } from './dto/confirmation.dto'
import { EmailConfirmationService } from './email-confirmation.service'

@Controller('auth/email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService
  ) {}

  @Post()
  async confirmEmail(@Req() req: Request, @Body() dto: ConfirmationDto) {
    return this.emailConfirmationService.confirmEmail(req, dto)
  }
}
