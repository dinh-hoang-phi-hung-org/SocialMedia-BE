import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: UserOrmEntity, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const confirmationUrl = `${frontendUrl}/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Social Media! Confirm your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a6ee0;">Welcome to Social Media!</h1>
          <p>Hi ${user.username},</p>
          <p>Thank you for registering. Please confirm your email address to activate your account.</p>
          <p>
            <a 
              href="${confirmationUrl}" 
              style="background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;"
            >
              Confirm Email Address
            </a>
          </p>
          <p>If you did not request this email you can safely ignore it.</p>
          <p>The link will expire in 1 hour.</p>
          <p>Best regards,<br>The Social Media Team</p>
        </div>
      `,
    });
  }
}
