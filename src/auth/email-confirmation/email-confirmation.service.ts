import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { TokenType } from '@prisma/__generated__'
import { Request } from 'express'
import { v4 } from 'uuid'

import { EmailService } from '@/libs/email/email.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { AuthService } from '../auth.service'

import { ConfirmationDto } from './dto/confirmation.dto'

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly emailService: EmailService
  ) {}

  async confirmEmail(req: Request, dto: ConfirmationDto) {
    const existingToken = await this.prisma.token.findUnique({
      where: {
        token: dto.token,
        type: TokenType.VERIFICATION,
      },
    })

    if (!existingToken) {
      throw new NotFoundException(
        'Токен подтверждения не найден. Пожалуйста, убедитесь, что у вас правильный токен.'
      )
    }

    const isExpired = new Date(existingToken.expiresIn) < new Date()

    if (isExpired) {
      throw new BadRequestException(
        'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения.'
      )
    }

    const existingUser = await this.userService.findByEmail(existingToken.email)

    if (!existingUser) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
      )
    }

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { isVerified: true },
    })

    await this.prisma.token.delete({
      where: { id: existingToken.id, type: TokenType.VERIFICATION },
    })

    return this.authService.saveSession(req, existingUser)
  }

  async sendConfirmationToken(email: string) {
    const verificationToken = await this.createConfirmationToken(email)

    await this.emailService.sendConfirmationEmail(
      verificationToken.email,
      verificationToken.token
    )
  }

  async createConfirmationToken(email: string) {
    const token = v4()
    const expiresIn = new Date(new Date().getTime() + 3600 * 1000)

    const existingToken = await this.prisma.token.findFirst({
      where: {
        email,
        type: TokenType.VERIFICATION,
      },
    })

    if (existingToken) {
      await this.prisma.token.delete({
        where: { id: existingToken.id },
      })
    }

    const verificationToken = await this.prisma.token.create({
      data: {
        email,
        token,
        expiresIn,
        type: TokenType.VERIFICATION,
      },
    })

    return verificationToken
  }
}
