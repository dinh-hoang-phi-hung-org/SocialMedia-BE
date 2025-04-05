import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly redisClient: Redis;
  private isConnected: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const redisConfig: any = {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    this.redisClient = new Redis(redisConfig);

    this.redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.isConnected = false;
    });

    this.redisClient.on('connect', () => {
      console.log('Redis connected successfully');
      this.isConnected = true;
    });
  }

  async onModuleInit() {
    try {
      await this.redisClient.ping();
      this.isConnected = true;
      console.log('Redis connection established');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  async addToBlacklist(token: string, expirationTime: number): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis is not connected, skipping blacklist operation');
      return;
    }

    try {
      const key = `blacklist:${token}`;
      const expirationSeconds = Math.ceil(expirationTime / 1000);

      // First check if token is already blacklisted
      const exists = await this.redisClient.exists(key);
      if (exists === 1) {
        // console.log(`Token already blacklisted: ${key}`);
        return;
      }

      // Add to blacklist with expiration
      await this.redisClient.set(
        key,
        JSON.stringify({
          blacklistedAt: Date.now(),
          expiresAt: Date.now() + expirationTime,
        }),
        'EX',
        expirationSeconds,
      );

      // console.log(`Token added to blacklist: ${key}, expires in ${expirationSeconds} seconds`);
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.isConnected) {
      console.warn('Redis is not connected, assuming token is not blacklisted');
      return false;
    }

    try {
      const key = `blacklist:${token}`;
      const result = await this.redisClient.get(key);

      if (!result) {
        console.log(`Token not found in blacklist: ${key}`);
        return false;
      }

      const blacklistData = JSON.parse(result);
      const now = Date.now();

      if (now >= blacklistData.expiresAt) {
        // Token has expired, remove it from blacklist
        await this.redisClient.del(key);
        console.log(`Expired token removed from blacklist: ${key}`);
        return false;
      }

      console.log(
        `Token found in blacklist: ${key}, expires in ${Math.ceil((blacklistData.expiresAt - now) / 1000)} seconds`,
      );
      return true;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  }
}
