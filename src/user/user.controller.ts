import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { UserRole } from '@prisma/__generated__'

import { Authorization } from '@/auth/decorators/authorization.decorator'
import { Authorized } from '@/auth/decorators/authorized.decorator'

import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get('profile')
  async findProfile(@Authorized('id') userId: string) {
    return this.userService.findById(userId)
  }

  @Authorization(UserRole.ADMIN)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id)
  }

  @Authorization()
  @Patch('profile')
  async update(@Authorized('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(userId, dto)
  }
}
