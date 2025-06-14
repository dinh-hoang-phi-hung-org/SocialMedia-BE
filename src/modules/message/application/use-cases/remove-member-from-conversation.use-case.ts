import { Injectable, NotFoundException } from '@nestjs/common';
import { UserConversationRepository } from '../../infrastructure/repositories/user-conversation.repository';
import { SocketGateway } from '../../../socket/socket.gateway';

@Injectable()
export class RemoveMemberFromConversationUseCase {
  constructor(
    private readonly userConversationRepository: UserConversationRepository,
    private readonly socketGateway: SocketGateway,
  ) {}

  async execute(conversationUuid: string, userUuid: string) {
    const userConversation = await this.userConversationRepository.findByUuidConversationAndUserUuid(
      conversationUuid,
      userUuid,
    );
    if (!userConversation) {
      throw new NotFoundException('User not found');
    }

    await this.userConversationRepository.delete(userConversation.uuid);

    this.socketGateway.sendToUser(userUuid, 'removedFromGroup', {
      conversationUuid,
      message: 'message:message.have-been-removed-from-the-group',
    });

    this.socketGateway.sendToConversation(
      conversationUuid,
      'memberRemoved',
      {
        conversationUuid,
        removedUserUuid: userUuid,
        message: 'A member has been removed from the group',
      },
      userUuid,
    );

    return {
      message: 'User removed from conversation successfully',
    };
  }
}
