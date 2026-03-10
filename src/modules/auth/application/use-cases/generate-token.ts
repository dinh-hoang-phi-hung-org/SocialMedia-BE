import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { GetTokenHelper } from '../../presentation/helper/get-token-data.helper';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const generateTokenResponse = async (
  user: UserOrmEntity,
  jwtService: JwtService,
  configService: ConfigService,
) => {
  const tokenData = await GetTokenHelper(
    {
      username: user.username,
      uuid: user.uuid,
      role: user.role,
    },
    jwtService,
    configService,
  );

  return {
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken,
    tokenExpires: tokenData.tokenExpires,
  };
};
