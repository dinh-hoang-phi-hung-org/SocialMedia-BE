import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '@/modules/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string): Promise<ApiSuccessResponse<{ message: string }>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const now = Date.now();
      const expiresAt = payload.exp * 1000;
      const remainingTime = Math.max(0, expiresAt - now);

      if (remainingTime > 0) {
        await this.redisService.addToBlacklist(token, remainingTime);
      } else {
        console.log('Token already expired, skipping blacklist');
      }

      return new ApiSuccessResponse({
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
