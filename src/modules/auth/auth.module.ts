import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './presentation/controller/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LoginByGoogleUseCase } from './application/use-cases/login-by-google.use-case';
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
import { AuthProviderOrmEntity } from './infrastructure/orm/auth-provider.entity.orm';
import { AuthProviderRepository } from './infrastructure/repositories/auth.repository';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([AuthProviderOrmEntity]),
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
    AuthProviderRepository,
    LoginUseCase,
    LoginByGoogleUseCase,
    SignupUseCase,
    GenerateVerificationTokenUseCase,
    VerifyEmailUseCase,
    LogoutUseCase,
    JwtAuthGuard,
    JwtStrategy,
  ],
  exports: [LoginUseCase, LoginByGoogleUseCase, SignupUseCase, AuthProviderRepository],
})
export class AuthModule {}
