import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { SocketGateway } from '../../../socket/socket.gateway';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { MediaFile } from '@/modules/storage/storage.service';
import { MessageMapper } from '../mapper/message.mapper';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly socketGateway: SocketGateway,
    private readonly messageMapper: MessageMapper,
    private readonly userRepository: UserRepository,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(
    conversationUuid: string,
    senderUuid: string,
    content: string,
    mediaObject: { images: MediaFile[]; videos: MediaFile[] },
  ) {
    const messageOrm = new MessageOrmEntity();
    messageOrm.senderUuid = senderUuid;
    messageOrm.conversationUuid = conversationUuid;
    messageOrm.content = content;
    messageOrm.mediaUrl = JSON.stringify(mediaObject);
    console.log('messageOrm', messageOrm);

    const message = await this.messageRepository.create(messageOrm);
    const sender = await this.userRepository.findByUuid(senderUuid);

    const conversation = await this.conversationRepository.findByUuid(conversationUuid);
    conversation.updatedAt = new Date();
    await this.conversationRepository.update(conversationUuid, conversation);

    message.sender = sender;
    message.conversation = conversation;

    console.log('message', this.messageMapper.toDTO(message, senderUuid));

    if (message) {
      this.socketGateway.sendToConversation(
        conversationUuid,
        'receiveMessage',
        this.messageMapper.toDTO(message, senderUuid),
      );
    }

    return message;
  }
}
