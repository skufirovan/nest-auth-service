import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class NewPasswordDto {
  @IsString({ message: 'Пароль должен быть строкой.' })
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения.' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы.',
    }
  )
  password: string
}
