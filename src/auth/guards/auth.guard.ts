import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { UserService } from '@/user/user.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (request.session.userId === undefined) {
      throw new UnauthorizedException(
        'Вы не авторизованы. Войдите в систему, чтобы получить доступ.'
      )
    }

    const user = await this.userService.findById(request.session.userId)

    request.user = user

    return true
  }
}
