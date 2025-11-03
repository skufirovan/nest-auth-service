import { Module } from '@nestjs/common'

import { EmailModule } from '@/libs/email/email.module'

import { TwoFactorAuthService } from './two-factor-auth.service'

@Module({
  imports: [EmailModule],
  providers: [TwoFactorAuthService],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
