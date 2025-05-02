import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

export interface TokenDataParams {
  username: UserOrmEntity['username'];
  uuid: UserOrmEntity['uuid'];
  role: UserOrmEntity['role'];
}

export interface TokenDataResult {
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
}

export const GetTokenHelper = async (
  data: TokenDataParams,
  jwtService: JwtService,
  configService: ConfigService,
): Promise<TokenDataResult> => {
  const tokenExpiresIn = configService.get('JWT_EXPIRATION_MS');
  const refreshTokenExpiresIn = configService.get('JWT_REFRESH_EXPIRATION_MS');

  if (!tokenExpiresIn) {
    throw new Error('JWT_EXPIRATION_MS is not defined');
  }

  if (!refreshTokenExpiresIn) {
    throw new Error('JWT_REFRESH_EXPIRATION_MS is not defined');
  }

  const tokenExpires = Date.now() + parseInt(tokenExpiresIn);

  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(
      {
        username: data.username,
        uuid: data.uuid,
        role: data.role,
      },
      {
        secret: configService.get('JWT_SECRET'),
        expiresIn: tokenExpiresIn,
      },
    ),
    jwtService.signAsync(
      {
        uuid: data.uuid,
      },
      {
        secret: configService.get('AUTH_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      },
    ),
  ]);

  return {
    accessToken,
    refreshToken,
    tokenExpires,
  };
};
