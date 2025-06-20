import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { FollowRepository } from '@/modules/follow/infrastructure/repositories/follow.repository';
import { CreationNotificationUseCase } from '@/modules/notification/application/use-cases/creation-notification.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FollowUserUseCase {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly creationNotificationUseCase: CreationNotificationUseCase,
  ) {}

  async execute(followingUuid: string, followerUuid: string): Promise<FollowOrmEntity> {
    const followOrmEntity = new FollowOrmEntity();
    followOrmEntity.follower_uuid = followerUuid;
    followOrmEntity.following_uuid = followingUuid;
    followOrmEntity.createdAt = new Date();
    const follow = await this.followRepository.create(followOrmEntity);

    await this.creationNotificationUseCase.execute(
      followerUuid,
      'follow',
      `notification:message.follow`,
      followingUuid,
      followingUuid,
    );

    return follow;
  }
}
