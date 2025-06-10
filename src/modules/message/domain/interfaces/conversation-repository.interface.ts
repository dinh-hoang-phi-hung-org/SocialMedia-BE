import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';

export interface IConversationRepository extends IBaseRepository<ConversationOrmEntity> {
  getUuidByUsers(senderId: string, receiverId: string): Promise<ConversationOrmEntity | null>;
  getUuidParticipantByUuidConversation(uuidConversation: string, userId: string): Promise<string[]>;
  findByUuids(uuids: string[]): Promise<ConversationOrmEntity[]>;
}
