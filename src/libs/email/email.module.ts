import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { EmailConfirmationModule } from '@/auth/email-confirmation/email-confirmation.module'
import { getMailerConfig } from '@/config/mailer.config'

import { EmailService } from './email.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),
    EmailConfirmationModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
