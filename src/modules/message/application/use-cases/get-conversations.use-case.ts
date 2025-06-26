import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { ConversationOrmEntity } from '../../infrastructure/orm/conversation.entity.orm';

@Injectable()
export class GetConversationsUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async execute(userId: string, query: SearchOptions): Promise<PaginatedResult<ConversationOrmEntity>> {
    return this.conversationRepository.getUserConversationsWithPagination(userId, query);
  }
}
