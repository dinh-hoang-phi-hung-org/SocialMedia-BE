import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@/shared/enum/role';

interface JwtPayload {
  uuid: string;
  username: string;
  role: UserRole;
  exp: number;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
    console.log('JWT Strategy initialized with secret:', this.configService.get('JWT_SECRET'));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(request: any, payload: JwtPayload) {
    if (!payload.role || !Object.values(UserRole).includes(payload.role)) {
      throw new UnauthorizedException('Invalid role in token');
    }

    const token = request.headers.authorization?.split(' ')[1];

    return {
      uuid: payload.uuid,
      username: payload.username,
      role: payload.role as UserRole,
      token: token,
    };
  }
}
