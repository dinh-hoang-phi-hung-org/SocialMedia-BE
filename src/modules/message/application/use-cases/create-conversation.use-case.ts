import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
@Injectable()
export class CreateConversationUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async execute(isGroupChat: boolean, title: string, adminUuid?: string): Promise<ConversationOrmEntity> {
    const conversationOrm = new ConversationOrmEntity();
    conversationOrm.isGroupChat = isGroupChat;
    conversationOrm.title = title;
    if (adminUuid) {
      conversationOrm.adminUuid = adminUuid;
    }
    conversationOrm.createdAt = new Date();
    conversationOrm.updatedAt = new Date();
    const conversation = await this.conversationRepository.create(conversationOrm);
    return conversation;
  }
}
