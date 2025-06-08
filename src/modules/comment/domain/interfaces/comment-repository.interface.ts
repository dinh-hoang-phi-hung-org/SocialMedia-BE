import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/orm/comment.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';

export interface ICommentRepository extends IBaseRepository<CommentOrmEntity> {
  findAllByPostUuid(postUuid: string, query: SearchOptions): Promise<PaginatedResult<CommentOrmEntity>>;
  findAllByPostUuidAndParentUuid(
    postUuid: string,
    parentUuid: string,
    query: SearchOptions,
  ): Promise<PaginatedResult<CommentOrmEntity>>;
  findByField(field: string, value: string): Promise<CommentOrmEntity[]>;
}
