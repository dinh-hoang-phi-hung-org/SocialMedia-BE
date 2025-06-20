import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repository/notification.repository';
import { NotificationOrmEntity } from '../../infrastructure/orm/notification.entity.orm';
import { SocketGateway } from '../../../socket/socket.gateway';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
@Injectable()
export class CreationNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly socketGateway: SocketGateway,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userUuid: string,
    type: string,
    content: string,
    relatedUuid: string,
    userRelatedUuid?: string,
  ): Promise<{
    notification: NotificationOrmEntity;
  }> {
    const notification = new NotificationOrmEntity();
    notification.userUuid = userUuid;
    notification.type = type;
    notification.content = content;
    notification.relatedUuid = relatedUuid;
    notification.isRead = false;
    notification.createdAt = new Date();

    if (userRelatedUuid) {
      notification.userRelatedUuid = userRelatedUuid;
    }

    const createdNotification = await this.notificationRepository.create(notification);

    let userRelated: UserOrmEntity | undefined = undefined;
    if (userRelatedUuid) {
      userRelated = await this.userRepository.findByUuid(userRelatedUuid);
    }
    const notificationData = {
      uuid: createdNotification.uuid,
      type: createdNotification.type,
      content: createdNotification.content,
      relatedUuid: createdNotification.relatedUuid,
      isRead: createdNotification.isRead,
      createdAt: createdNotification.createdAt,
      userRelated: {
        uuid: userRelated?.uuid,
        username: userRelated?.username,
        profilePictureUrl: userRelated?.profile_picture_url,
      },
    };

    this.socketGateway.sendToUser(userUuid, 'newNotification', notificationData);

    return { notification: createdNotification };
  }
}
