import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';
import { IFollowRepository } from '@/modules/follow/domain/interfaces/follow-repository.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { SortDirection } from '@/shared/enum/sort-direction';

@Injectable()
export class GetHomeFeedUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    @Inject('IFollowRepository')
    private readonly followRepository: IFollowRepository,
  ) {}

  async execute(currentUserUuid: string, query: SearchOptions): Promise<PaginatedResult<PostOrmEntity>> {
    const { page, limit } = query;

    const followingResult = await this.followRepository.findByFollowingUuid(currentUserUuid, {
      page: 1,
      limit: 1000,
      searchFields: [],
      searchValue: '',
      sortBy: 'createdAt',
      sortDirection: SortDirection.DESC,
    });

    const followingUuids = followingResult.data.map((follow) => follow.following_uuid);

    const followedPosts = await this.postRepository.findHomeFeedPosts(followingUuids, currentUserUuid, {
      page,
      limit,
      prioritizeFollowed: true,
    });

    return followedPosts;
  }
}
