import { forwardRef, Module } from '@nestjs/common'

import { EmailModule } from '@/libs/email/email.module'
import { UserModule } from '@/user/user.module'

import { AuthModule } from '../auth.module'

import { EmailConfirmationController } from './email-confirmation.controller'
import { EmailConfirmationService } from './email-confirmation.service'

@Module({
  imports: [forwardRef(() => AuthModule), UserModule, EmailModule],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
