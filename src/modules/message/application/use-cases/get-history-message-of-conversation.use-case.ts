import { Injectable } from '@nestjs/common';
import { MessageRepository } from '@/modules/message/infrastructure/repositories/message.repository';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
@Injectable()
export class GetHistoryMessageOfConversationUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(conversationUuid: string, query: SearchOptions): Promise<PaginatedResult<MessageOrmEntity>> {
    const messages = await this.messageRepository.getMessagesByConversationUuid(conversationUuid, query);
    return messages;
  }
}
