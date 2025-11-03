import { FactoryProvider, ModuleMetadata } from '@nestjs/common'

import { BaseOAuthService } from './services/base-oauth.service'

export const ProviderOptionsSymbol = Symbol()

export type Options = {
  baseUrl: string
  services: BaseOAuthService[]
}

export type AsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<Options>, 'useFactory' | 'inject'>
