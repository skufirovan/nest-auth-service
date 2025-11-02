import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha'

import { getRecaptchaConfig } from '@/config/recaptcha.config'
import { UserModule } from '@/user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRecaptchaConfig,
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
