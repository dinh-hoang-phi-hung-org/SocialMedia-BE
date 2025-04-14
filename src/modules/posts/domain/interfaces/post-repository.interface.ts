import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
export interface IPostRepository extends IBaseRepository<PostOrmEntity> {
  findAllByUuidUser(uuid: string, query: SearchOptions): Promise<PaginatedResult<PostOrmEntity>>;
}
