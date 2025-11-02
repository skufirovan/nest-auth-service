import { Injectable, NotFoundException } from '@nestjs/common'
import { AuthMethod } from '@prisma/__generated__'

import { PrismaService } from '@/prisma/prisma.service'

import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    email: string,
    password: string,
    username: string,
    method: AuthMethod,
    picture?: string
  ) {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        username,
        picture,
        method,
      },
      include: { accounts: true },
    })

    return user
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    })

    if (!user) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введенные данные.'
      )
    }

    return user
  }

  async findByEmail(email: string) {
    const userOrNull = await this.prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    return userOrNull
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        email: dto.email,
        isTwoFactorEnabled: dto.isTwoFactorEnabled,
      },
    })

    return user
  }
}
