import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // First check if token is blacklisted
      const isBlacklisted = await this.redisService.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been blacklisted');
      }

      // If not blacklisted, validate the JWT token
      const isValid = await super.canActivate(context);
      if (!isValid) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get the user from the request (set by Passport)
      const user = request.user;
      if (!user) {
        throw new UnauthorizedException('User not found in token');
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Auth error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
