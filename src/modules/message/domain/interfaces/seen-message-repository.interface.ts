import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SeenMessageOrmEntity } from '@/modules/message/infrastructure/orm/seen-message.entity.orm';

export interface ISeenMessageRepository extends IBaseRepository<SeenMessageOrmEntity> {
  checkSeenMessage(messageUuid: string, userUuid: string): Promise<boolean>;
}
