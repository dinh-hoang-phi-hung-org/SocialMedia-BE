import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

export interface IFollowRepository extends IBaseRepository<FollowOrmEntity> {
  findByFollowerUuidAndFollowingUuid(followerUuid: string, followingUuid: string): Promise<FollowOrmEntity | null>;
  findByFollowingUuid(followerUuid: string, query: SearchOptions): Promise<PaginatedResult<FollowOrmEntity>>;
  findByFollowerUuid(followingUuid: string, query: SearchOptions): Promise<PaginatedResult<FollowOrmEntity>>;
}
