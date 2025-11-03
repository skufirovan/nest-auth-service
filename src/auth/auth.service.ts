import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/__generated__'
import { hash, verify } from 'argon2'
import type { Request, Response } from 'express'

import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service'
import { ProviderService } from './provider/provider.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => EmailConfirmationService))
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService
  ) {}

  async register(dto: RegisterDto) {
    const isExist = await this.userService.findByEmail(dto.email)

    if (isExist) {
      throw new ConflictException('Пользователь с таким email уже сущетсвует.')
    }

    const hashPassword = await hash(dto.password)
    const user = await this.userService.create(
      dto.email,
      hashPassword,
      dto.name,
      AuthMethod.CREDENTIALS
    )

    await this.emailConfirmationService.sendConfirmationToken(user.email)

    return {
      message:
        'Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовый адрес.',
    }
  }

  async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user || !user.password) {
      throw new NotFoundException(
        'Пользователь не найден. Проверьте введённые данные.'
      )
    }

    const isValidPassword = await verify(user.password, dto.password)

    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Неверный пароль. Попробуйте еще раз или восстановите пароль'
      )
    }

    if (!user.isVerified) {
      await this.emailConfirmationService.sendConfirmationToken(user.email)
      throw new UnauthorizedException(
        'Ваш email не подтвержден. Ссылка для подтверждения отправлена вам на почту'
      )
    }

    return this.saveSession(req, user)
  }

  async extractProfileFromCode(req: Request, provider: string, code: string) {
    const providerInstance = this.providerService.findByService(provider)

    if (!providerInstance) return

    const profile = await providerInstance.findUserByCode(code)

    const account = await this.prisma.account.findFirst({
      where: {
        id: profile.id,
        provider: profile.provider,
      },
    })

    let user = account?.userId
      ? await this.userService.findById(account.userId)
      : null

    if (user) {
      return this.saveSession(req, user)
    }

    user = await this.userService.create(
      profile.email,
      '',
      profile.name,
      AuthMethod[profile.provider.toUpperCase()],
      profile.picture,
      true
    )

    if (!account) {
      await this.prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: profile.provider,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: Number(profile.expires_at),
        },
      })
    }

    return this.saveSession(req, user)
  }

  async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена'
            )
          )
        }

        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
        resolve()
      })
    })
  }

  async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id

      req.session.save(err => {
        if (err) {
          return reject(
            new InternalServerErrorException('Не удалось сохранить сессию')
          )
        }

        resolve({ user })
      })
    })
  }
}
