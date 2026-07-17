import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

type AuthenticatedUser = {
  uuid: string;
  username?: string;
};

@Injectable()
export class CallService {
  constructor(private readonly configService: ConfigService) {}

  async createLiveKitToken(roomName: string, user: AuthenticatedUser, displayName?: string) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const livekitUrl = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !livekitUrl) {
      throw new InternalServerErrorException('LiveKit is not configured');
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.uuid,
      name: displayName || user.username || user.uuid,
      ttl: '1h',
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    return {
      token: await token.toJwt(),
      url: livekitUrl,
      roomName,
    };
  }
}
