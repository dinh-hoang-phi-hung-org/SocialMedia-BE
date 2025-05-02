import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { LoginDto } from '@/modules/auth/presentation/dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GetTokenHelper } from '@/modules/auth/presentation/helper/get-token-data.helper';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { LoginResponseDto } from '@/modules/auth/presentation/dtos/login-response.dto';
import { comparePassword } from '@/shared/helpers/bcrypt';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('common:auth.invalid-credentials');
    } else if (!user.is_active) {
      throw new UnauthorizedException('common:auth.user-not-verified');
    }

    const isPasswordValid = await comparePassword(loginDto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('common:auth.invalid-credentials');
    }

    user.last_login = new Date();
    await this.userRepository.update(user.uuid, { last_login: user.last_login });

    const tokenResponse = await this.generateTokenResponse(user);

    return tokenResponse;
  }

  private async generateTokenResponse(user: UserOrmEntity) {
    const tokenData = await GetTokenHelper(
      {
        username: user.username,
        uuid: user.uuid,
        role: user.role,
      },
      this.jwtService,
      this.configService,
    );

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenExpires: tokenData.tokenExpires,
    };
  }
}
