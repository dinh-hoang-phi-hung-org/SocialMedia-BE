import { SeenMessageOrmEntity } from '@/modules/message/infrastructure/orm/seen-message.entity.orm';
import { SeenMessageRepository } from '@/modules/message/infrastructure/repositories/seen-message.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SeenMessageConversationUseCase {
  constructor(private readonly seenMessageRepository: SeenMessageRepository) {}

  async execute(messageUuid: string, userUuid: string): Promise<SeenMessageOrmEntity> {
    const newSeenMessage = new SeenMessageOrmEntity();
    newSeenMessage.messageUuid = messageUuid;
    newSeenMessage.userUuid = userUuid;
    newSeenMessage.createdAt = new Date();
    return this.seenMessageRepository.create(newSeenMessage);
  }
}
