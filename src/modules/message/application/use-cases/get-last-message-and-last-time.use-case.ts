import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { MessageOrmEntity } from '../../infrastructure/orm/message.entity.orm';

@Injectable()
export class GetLastMessageAndLastTimeUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(conversationUuid: string): Promise<MessageOrmEntity | null> {
    const message = await this.messageRepository.getLastMessageAndLastTime(conversationUuid);
    if (!message) {
      return null;
    }
    return message;
  }
}
