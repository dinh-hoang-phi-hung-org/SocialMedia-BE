import { FollowRepository } from '@/modules/follow/infrastructure/repositories/follow.repository';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { Injectable } from '@nestjs/common';
import { SearchOptions } from '@/shared/types/search-options';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
@Injectable()
export class GetFollowersListUseCase {
  constructor(private readonly followRepository: FollowRepository) {}

  async execute(uuid: string, query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const followers = await this.followRepository.findByFollowerUuid(uuid, query);
    const followersData = followers.data.map((follower) => follower.follower);

    return {
      data: followersData,
      meta: followers.meta,
    };
  }
}
