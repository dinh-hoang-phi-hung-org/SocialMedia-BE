import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
@Injectable()
export class GetConversationByUuidUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async execute(conversationUuid: string): Promise<ConversationOrmEntity | null> {
    const conversation = await this.conversationRepository.findConversationByUuid(conversationUuid);
    return conversation;
  }
}
