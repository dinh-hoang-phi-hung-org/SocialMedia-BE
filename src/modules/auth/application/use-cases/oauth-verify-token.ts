import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
