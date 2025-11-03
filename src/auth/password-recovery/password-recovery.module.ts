import { Module } from '@nestjs/common'

import { EmailModule } from '@/libs/email/email.module'
import { UserModule } from '@/user/user.module'

import { PasswordRecoveryController } from './password-recovery.controller'
import { PasswordRecoveryService } from './password-recovery.service'

@Module({
  imports: [UserModule, EmailModule],
  controllers: [PasswordRecoveryController],
  providers: [PasswordRecoveryService],
})
export class PasswordRecoveryModule {}
