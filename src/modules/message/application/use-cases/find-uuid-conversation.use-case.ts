import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
@Injectable()
export class FindUuidConversationUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async execute(senderId: string, receiverId: string): Promise<ConversationOrmEntity | null> {
    const conversation = await this.conversationRepository.getUuidByUsers(senderId, receiverId);
    return conversation;
  }
}
