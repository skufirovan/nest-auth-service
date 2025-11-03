import {
	Body,
	Heading,
	Link,
	Text
} from '@react-email/components';
import { Html } from '@react-email/html';
import React from 'react';

interface ResetPasswordTemplateProps {
	domain: string;
	token: string;
}

export function ResetPasswordTemplate({ domain, token }: ResetPasswordTemplateProps) {
	const resetLink = `${domain}/auth/new-password?token=${token}`;

	return (
    <Html>
      <Body>
        <Heading>Сброс пароля</Heading>
        <Text>
          Привет! Вы запросили сброс пароля. Пожалуйста, перейдите по следующей ссылке, чтобы создать новый пароль:
        </Text>
        <Link href={resetLink}>Подтвердить сброс пароля</Link>
        <Text>
          Эта ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, просто проигнорируйте это сообщение.
        </Text>
      </Body>
    </Html>
	);
}