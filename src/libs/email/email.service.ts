import { MailerService } from '@nestjs-modules/mailer'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import { EmailConfirmationService } from '@/auth/email-confirmation/email-confirmation.service'

import { ConfirmationTemplate } from './templates/confirmation.template'

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => EmailConfirmationService))
    private readonly emailConfirmationService: EmailConfirmationService
  ) {}

  async sendConfirmationEmail(email: string) {
    const { token } =
      await this.emailConfirmationService.createConfirmationToken(email)

    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const html = await render(ConfirmationTemplate({ domain, token }))

    return this.sendMail(email, 'Подтверждение почты', html)
  }

  private sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    })
  }
}
