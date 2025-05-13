import { Injectable } from '@nestjs/common';
import { UserConversation } from '@/modules/message/infrastructure/orm/user-conversation.entity.orm';
import { UserConversationRepository } from '@/modules/message/infrastructure/repositories/user-conversation.repository';
@Injectable()
export class CreateUserConversationUseCase {
  constructor(private readonly userConversationRepository: UserConversationRepository) {}

  async execute(conversationUuid: string, userId: string): Promise<UserConversation> {
    const userConversationOrm = new UserConversation();
    userConversationOrm.conversationUuid = conversationUuid;
    userConversationOrm.userUuid = userId;
    const userConversation = await this.userConversationRepository.create(userConversationOrm);

    return userConversation;
  }
}
