import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'email-verification') {
        throw new UnauthorizedException('Invalid token type');
      }

      const uuid = payload.sub;
      const user = await this.userRepository.findByUuid(uuid);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.userRepository.update(uuid, { is_active: true });

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
