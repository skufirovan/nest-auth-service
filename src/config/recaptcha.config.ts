import { ConfigService } from '@nestjs/config'
import type { GoogleRecaptchaModuleOptions } from '@nestlab/google-recaptcha'

import { isDev } from '@/libs/common/utils/is-dev.utils'

export const getRecaptchaConfig = async (
  configService: ConfigService
): Promise<GoogleRecaptchaModuleOptions> => ({
  secretKey: configService.getOrThrow<string>('GOOGLE_RECAPTCHA_SECRET'),
  response: req => req.headers.recaptcha,
  skipIf: isDev(configService),
})
