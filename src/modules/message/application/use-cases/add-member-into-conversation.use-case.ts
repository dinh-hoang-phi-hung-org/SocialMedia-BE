import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { UserConversationRepository } from '../../infrastructure/repositories/user-conversation.repository';
import { UserConversation } from '../../infrastructure/orm/user-conversation.entity.orm';

@Injectable()
export class AddMemberIntoConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly userConversationRepository: UserConversationRepository,
  ) {}

  async execute(conversationUuid: string, participantUuids: string[]) {
    const conversation = await this.conversationRepository.findByUuid(conversationUuid);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    for (const participantUuid of participantUuids) {
      const userConversation = new UserConversation();
      userConversation.conversationUuid = conversationUuid;
      userConversation.userUuid = participantUuid;
      userConversation.createdAt = new Date();

      await this.userConversationRepository.create(userConversation);
    }

    return {
      message: 'User added to conversation successfully',
    };
  }
}
