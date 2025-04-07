import { FollowRepository } from '@/modules/follow/infrastructure/repositories/follow.repository';
import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class GetFollowingsListUseCase {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(uuid: string, query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const followers = await this.followRepository.findByFollowingUuid(uuid, query);
    const followersData = followers.data.map((follower) => follower.following);
    return {
      data: followersData,
      meta: followers.meta,
    };
  }
}
