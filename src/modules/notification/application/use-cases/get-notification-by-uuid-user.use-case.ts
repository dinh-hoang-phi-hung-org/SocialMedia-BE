import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repository/notification.repository';
import { NotificationOrmEntity } from '../../infrastructure/orm/notification.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

@Injectable()
export class GetNotificationByUuidUserUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userUuid: string, query: SearchOptions): Promise<PaginatedResult<NotificationOrmEntity>> {
    return this.notificationRepository.findByUserUuid(userUuid, query);
  }
}
