import { forwardRef, Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { AuthModule } from '../auth.module'

import { EmailConfirmationController } from './email-confirmation.controller'
import { EmailConfirmationService } from './email-confirmation.service'

@Module({
  imports: [forwardRef(() => AuthModule), UserModule],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
