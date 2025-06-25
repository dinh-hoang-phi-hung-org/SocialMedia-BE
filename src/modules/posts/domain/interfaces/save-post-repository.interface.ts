import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SavePostOrmEntity } from '../../infrastructure/orm/save-posts.entity.orm';
export interface ISavePostRepository extends IBaseRepository<SavePostOrmEntity> {
  isPostSaved(postUuid: string, userUuid: string): Promise<string | null>;
  getSavedPosts(userUuid: string, options: SearchOptions): Promise<PaginatedResult<SavePostOrmEntity>>;
}
