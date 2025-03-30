import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

export type IUserRepository = IBaseRepository<UserOrmEntity>;
