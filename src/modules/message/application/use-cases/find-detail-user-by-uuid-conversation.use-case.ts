import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';

@Injectable()
export class FindDetailUserByUuidConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(uuidConversation: string, userId: string): Promise<ShortcutUserResponseDto> {
    const uuidParticipants = await this.conversationRepository.getUuidParticipantByUuidConversation(
      uuidConversation,
      userId,
    );
    if (!uuidParticipants || uuidParticipants.length === 0) {
      throw new NotFoundException('User not found');
    }

    const uuidParticipant = uuidParticipants[0];
    const user = await this.userRepository.findByUuid(uuidParticipant);
    return {
      uuid: user.uuid,
      username: user.username,
      profilePictureUrl: user.profile_picture_url,
    };
  }
}
