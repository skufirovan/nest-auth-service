import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import type { Options } from './provider.constants'
import { ProviderOptionsSymbol } from './provider.constants'
import { BaseOAuthService } from './services/base-oauth.service'

@Injectable()
export class ProviderService implements OnModuleInit {
  constructor(
    @Inject(ProviderOptionsSymbol) private readonly options: Options
  ) {}

  onModuleInit() {
    for (const provider of this.options.services) {
      provider.baseUrl = this.options.baseUrl
    }
  }

  findByService(service: string): BaseOAuthService | null {
    return this.options.services.find(s => s.name === service) ?? null
  }
}
