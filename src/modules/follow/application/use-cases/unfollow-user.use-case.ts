import { FollowRepository } from '@/modules/follow/infrastructure/repositories/follow.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UnfollowUserUseCase {
  constructor(private readonly followRepository: FollowRepository) {}

  async execute(followingUuid: string, followerUuid: string): Promise<void> {
    const follow = await this.followRepository.findByFollowerUuidAndFollowingUuid(followerUuid, followingUuid);
    if (!follow) {
      throw new NotFoundException('Follow not found');
    }
    await this.followRepository.delete(follow.uuid);
  }
}
