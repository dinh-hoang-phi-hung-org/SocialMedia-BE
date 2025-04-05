import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controller/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { UsersModule } from '@/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignupUseCase } from '@/modules/auth/application/use-cases/signup.use-case';
import { MailModule } from '@/modules/mail/mail.module';
import { GenerateVerificationTokenUseCase } from '@/modules/auth/application/use-cases/generate-verification-token.use-case';
import { VerifyEmailUseCase } from '@/modules/auth/application/use-cases/verify-email.use-case';
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case';
import { RedisModule } from '@/modules/redis/redis.module';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { JwtStrategy } from '@/shared/strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    MailModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    SignupUseCase,
    GenerateVerificationTokenUseCase,
    VerifyEmailUseCase,
    LogoutUseCase,
    JwtAuthGuard,
    JwtStrategy,
  ],
  exports: [LoginUseCase, SignupUseCase],
})
export class AuthModule {}
