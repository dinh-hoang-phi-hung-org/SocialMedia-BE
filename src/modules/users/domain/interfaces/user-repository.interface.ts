import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
export interface IUserRepository extends IBaseRepository<UserOrmEntity> {
  findByEmail(email: string): Promise<UserOrmEntity | null>;
  findByUsername(email: string): Promise<UserOrmEntity | null>;
  getUserWithoutMe(userId: string, query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>>;
}
