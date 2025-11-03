import { Body, Controller, Param, Post } from '@nestjs/common'
import { Recaptcha } from '@nestlab/google-recaptcha'

import { NewPasswordDto } from './dto/new-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { PasswordRecoveryService } from './password-recovery.service'

@Controller('auth/password-recovery')
export class PasswordRecoveryController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService
  ) {}

  @Recaptcha()
  @Post('reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordRecoveryService.resetPassword(dto)
  }

  @Recaptcha()
  @Post('confirm/:token')
  async setNewPassword(
    @Body() dto: NewPasswordDto,
    @Param('token') token: string
  ) {
    return this.passwordRecoveryService.setNewPassword(dto, token)
  }
}
