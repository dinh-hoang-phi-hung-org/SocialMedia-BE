import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

export interface IUserRepository extends IBaseRepository<UserOrmEntity> {
  findByEmail(email: string): Promise<UserOrmEntity | null>;
  findByEmailOrUsername(email: string, username: string): Promise<UserOrmEntity | null>;
}
