import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { FollowRepository } from '@/modules/follow/infrastructure/repositories/follow.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FollowUserUseCase {
  constructor(private readonly followRepository: FollowRepository) {}

  async execute(followingUuid: string, followerUuid: string): Promise<FollowOrmEntity> {
    const followOrmEntity = new FollowOrmEntity();
    followOrmEntity.following_uuid = followingUuid;
    followOrmEntity.follower_uuid = followerUuid;
    followOrmEntity.createdAt = new Date();
    const follow = await this.followRepository.create(followOrmEntity);
    return follow;
  }
}
