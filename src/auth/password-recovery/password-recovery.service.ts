import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { TokenType } from '@prisma/__generated__'
import { hash } from 'argon2'
import { v4 } from 'uuid'

import { EmailService } from '@/libs/email/email.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { NewPasswordDto } from './dto/new-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly emailService: EmailService
  ) {}

  async resetPassword(dto: ResetPasswordDto) {
    const existingUser = await this.userService.findByEmail(dto.email)

    if (!existingUser) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
      )
    }

    const passwordResetToken = await this.createPasswordResetToken(
      existingUser.email
    )

    await this.emailService.sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    )
  }

  async setNewPassword(dto: NewPasswordDto, token: string) {
    const existingToken = await this.prisma.token.findFirst({
      where: { token },
    })

    if (!existingToken) {
      throw new NotFoundException(
        'Токен не найден. Пожалуйста, проверьте правильность введенного токена или запросите новый.'
      )
    }

    const isExpired = new Date(existingToken.expiresIn) < new Date()

    if (isExpired) {
      throw new BadRequestException(
        'Токен истек. Пожалуйста, запросите новый токен для подтверждения сброса пароля.'
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
      data: { password: await hash(dto.password) },
    })

    await this.prisma.token.delete({ where: { id: existingToken.id } })
  }

  async createPasswordResetToken(email: string) {
    const token = v4()
    const expiresIn = new Date(new Date().getTime() + 3600 * 1000)

    const existingToken = await this.prisma.token.findFirst({
      where: {
        email,
        type: TokenType.PASSWORD_RESET,
      },
    })

    if (existingToken) {
      await this.prisma.token.delete({
        where: { id: existingToken.id },
      })
    }

    const passwordResetToken = await this.prisma.token.create({
      data: {
        email,
        token,
        expiresIn,
        type: TokenType.PASSWORD_RESET,
      },
    })

    return passwordResetToken
  }
}
