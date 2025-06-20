import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { Injectable } from '@nestjs/common';
import { formatTime } from '@/shared/helpers/formatTime';
import { NotificationOrmEntity } from '@/modules/notification/infrastructure/orm/notification.entity.orm';
import { NotificationResponseDto } from '@/modules/notification/presentation/dtos/notification-response.dto';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class NotificationMapper {
  toDTO(notification: NotificationOrmEntity & { userRelated?: UserOrmEntity }): NotificationResponseDto {
    return {
      uuid: notification.uuid,
      type: notification.type,
      userUuid: notification.userUuid,
      content: notification.content,
      relatedUuid: notification.relatedUuid || '',
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      userRelated: notification.userRelated
        ? {
            uuid: notification.userRelated.uuid,
            username: notification.userRelated.username,
            profilePictureUrl: notification.userRelated.profile_picture_url,
          }
        : undefined,
    };
  }

  toPaginatedDTO(
    paginatedResult: PaginatedResult<NotificationOrmEntity & { userRelated?: UserOrmEntity }>,
  ): PaginatedResult<NotificationResponseDto> {
    return {
      data: paginatedResult.data.map((notification) => this.toDTO(notification)),
      meta: {
        total: paginatedResult.meta.total,
        page: paginatedResult.meta.page,
        lastPage: paginatedResult.meta.lastPage,
      },
    };
  }
}
