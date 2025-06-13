import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
import { UpdateConversationDto } from '../../presentation/dtos/conversation.dto';
@Injectable()
export class UpdateConversationUseCase {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  async execute(updateConversationDto: UpdateConversationDto): Promise<void> {
    const conversation = await this.conversationRepository.findByUuid(updateConversationDto.conversationUuid);
    if (updateConversationDto.conversationGroupPictureUrl) {
      conversation.groupPictureUrl = updateConversationDto.conversationGroupPictureUrl;
    }
    await this.conversationRepository.update(updateConversationDto.conversationUuid, conversation);
  }
}
