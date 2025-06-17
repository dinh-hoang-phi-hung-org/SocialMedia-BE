import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/repository/notification.repository';

@Injectable()
export class ReadNotificationUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userUuid: string, uuid: string): Promise<void> {
    await this.notificationRepository.updateField(uuid, 'isRead', true);
  }
}
