import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { UserRepository } from '../../../users/infrastructure/repositories/user.repository';
import { AuthProviderRepository } from '../../infrastructure/repositories/auth.repository';
import { UserOrmEntity } from '../../../users/infrastructure/orm/users.entity.orm';
import { LoginResponseDto } from '../../presentation/dtos/login-response.dto';
import { ApiFailureResponse, ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { AuthProviderOrmEntity } from '../../infrastructure/orm/auth-provider.entity.orm';
import { AuthProvider } from '@/shared/enum/auth-provider';
import { generateTokenResponse } from './generate-token';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginByGoogleUseCase {
  constructor(
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
    private readonly authProviderRepository: AuthProviderRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(code: string): Promise<ApiSuccessResponse<LoginResponseDto>> {
    try {
      const tokenData = await this.getGoogleToken(code);

      const googleUser = await this.getGoogleUserInfo(tokenData.access_token);

      const googleId = googleUser.sub;

      const provider = await this.authProviderRepository.findByGoogleId(googleId);

      let user: UserOrmEntity;

      if (provider) {
        user = provider.user;
      } else {
        const existingUser = await this.userRepository.findByEmail(googleUser.email);

        if (existingUser && !existingUser.is_google_account) {
          throw new ApiFailureResponse('common:auth.google-account-already-exists');
        }

        if (!existingUser) {
          const newUser = new UserOrmEntity();
          newUser.email = googleUser.email;
          newUser.username = googleUser.email;
          newUser.first_name = googleUser.given_name;
          newUser.last_name = googleUser.family_name;
          newUser.google_id = googleId;
          newUser.is_google_account = true;

          user = await this.userRepository.create(newUser);
        } else {
          user = existingUser;
        }

        const authProvider = new AuthProviderOrmEntity();
        authProvider.provider = AuthProvider.GOOGLE;
        authProvider.provider_user_id = googleId;
        authProvider.user = user;

        await this.authProviderRepository.create(authProvider);
      }

      const tokenResponse = await generateTokenResponse(user, this.jwtService, this.configService);

      return new ApiSuccessResponse(tokenResponse);
    } catch (error) {
      return new ApiFailureResponse(`Google login failed: ${error.message}`);
    }
  }

  private async getGoogleToken(code: string) {
    const response = await firstValueFrom(
      this.httpService.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code',
      }),
    );

    return response.data;
  }

  private async getGoogleUserInfo(accessToken: string) {
    const response = await firstValueFrom(
      this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return response.data;
  }
}
