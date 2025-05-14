import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { UserConversation } from '@/modules/message/infrastructure/orm/user-conversation.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';

export interface IUserConversationRepository extends IBaseRepository<UserConversation> {
  getUserConversations(userId: string, query: SearchOptions): Promise<PaginatedResult<UserConversation>>;
}
