import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { NotificationOrmEntity } from '../../infrastructure/orm/notification.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

export interface INotificationRepository extends IBaseRepository<NotificationOrmEntity> {
  findByUserUuid(userUuid: string, query: SearchOptions): Promise<PaginatedResult<NotificationOrmEntity>>;
}
