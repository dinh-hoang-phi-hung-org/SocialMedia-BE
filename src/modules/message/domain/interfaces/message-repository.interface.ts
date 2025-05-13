import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

export interface IMessageRepository extends IBaseRepository<MessageOrmEntity> {
  getMessagesByConversationUuid(
    conversationUuid: string,
    query: SearchOptions,
  ): Promise<PaginatedResult<MessageOrmEntity>>;
  getLastMessageAndLastTime(conversationUuid: string): Promise<MessageOrmEntity>;
}
