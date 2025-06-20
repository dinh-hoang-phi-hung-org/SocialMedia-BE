import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
import { UpdateConversationDto } from '../../presentation/dtos/conversation.dto';
@Injectable()
export class UpdateConversationUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async execute(updateConversationDto: UpdateConversationDto): Promise<void> {
    await this.conversationRepository.findByUuid(updateConversationDto.conversationUuid);

    if (updateConversationDto.conversationGroupPictureUrl) {
      await this.conversationRepository.updateField(
        updateConversationDto.conversationUuid,
        'groupPictureUrl',
        updateConversationDto.conversationGroupPictureUrl,
      );
    }
  }
}
