import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/__generated__'
import { hash, verify } from 'argon2'
import type { Request, Response } from 'express'

import { UserService } from '@/user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  async register(req: Request, dto: RegisterDto) {
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

    return this.saveSession(req, user)
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

  private async saveSession(req: Request, user: User) {
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
