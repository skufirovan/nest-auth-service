import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { TokenType } from '@prisma/__generated__'

import { EmailService } from '@/libs/email/email.service'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async validateTwoFactorToken(email: string, token: string) {
    const existingToken = await this.prisma.token.findFirst({
      where: {
        email,
        type: TokenType.TWO_FACTOR,
      },
    })

    if (!existingToken) {
      throw new NotFoundException(
        'Токен двухфакторной аутентификации не найден. Убедитесь, что вы запрашивали токен для данного адреса электронной почты.'
      )
    }

    if (existingToken.token !== token) {
      throw new BadRequestException(
        'Неверный код двухфакторной аутентификации. Пожалуйста, проверьте введенный код и попробуйте снова.'
      )
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date()

    if (hasExpired) {
      throw new BadRequestException(
        'Срок действия токена двухфакторной аутентификации истек. Пожалуйста, запросите новый токен.'
      )
    }

    await this.prisma.token.delete({
      where: { id: existingToken.id },
    })
  }

  async sendTwoFactorToken(email: string) {
    const twoFactorToken = await this.createTwoFactorToken(email)

    await this.emailService.sendTwoFactorTokenEmail(
      twoFactorToken.email,
      twoFactorToken.token
    )
  }

  async createTwoFactorToken(email: string) {
    const token = Math.floor(
      Math.random() * (1000000 - 100000) + 100000
    ).toString()

    const expiresIn = new Date(new Date().getTime() + 300000)

    const existingToken = await this.prisma.token.findFirst({
      where: {
        email,
        type: TokenType.TWO_FACTOR,
      },
    })

    if (existingToken) {
      await this.prisma.token.delete({
        where: { id: existingToken.id },
      })
    }

    const twoFactorToken = await this.prisma.token.create({
      data: {
        email,
        token,
        expiresIn,
        type: TokenType.TWO_FACTOR,
      },
    })

    return twoFactorToken
  }
}
