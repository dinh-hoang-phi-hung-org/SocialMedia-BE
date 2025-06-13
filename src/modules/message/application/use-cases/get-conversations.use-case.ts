import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { ConversationOrmEntity } from '../../infrastructure/orm/conversation.entity.orm';
import { UserConversationRepository } from '../../infrastructure/repositories/user-conversation.repository';
@Injectable()
export class GetConversationsUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly userConversationRepository: UserConversationRepository,
  ) {}

  async execute(userId: string, query: SearchOptions): Promise<PaginatedResult<ConversationOrmEntity>> {
    const userConversations = await this.userConversationRepository.getUserConversations(userId, query);
    console.log(userConversations);
    const conversationUuids = userConversations.data.map((userConversation) => userConversation.conversationUuid);
    const conversations = await this.conversationRepository.findByUuids(conversationUuids);
    return {
      data: conversations,
      meta: userConversations.meta,
    };
  }
}
