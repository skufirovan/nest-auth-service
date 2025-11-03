import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Request } from 'express'

import { ProviderService } from '../provider/provider.service'

@Injectable()
export class ProviderGuard implements CanActivate {
  constructor(private readonly providerService: ProviderService) {}

  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest()

    const provider = request.params.provider

    const providerInstance = this.providerService.findByService(provider)

    if (!providerInstance) {
      throw new NotFoundException(
        `Провайдер ${provider} не найден. Проверьте правильность введенных данных.`
      )
    }

    return true
  }
}
