import { DynamicModule, Module } from '@nestjs/common'

import {
  AsyncOptions,
  Options,
  ProviderOptionsSymbol,
} from './provider.constants'
import { ProviderService } from './provider.service'

@Module({})
export class ProviderModule {
  static register(options: Options): DynamicModule {
    return {
      module: ProviderModule,
      providers: [
        {
          useValue: options.services,
          provide: ProviderOptionsSymbol,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    }
  }

  static registerAsync(options: AsyncOptions): DynamicModule {
    return {
      module: ProviderModule,
      imports: options.imports,
      providers: [
        {
          useFactory: options.useFactory,
          provide: ProviderOptionsSymbol,
          inject: options.inject,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    }
  }
}
