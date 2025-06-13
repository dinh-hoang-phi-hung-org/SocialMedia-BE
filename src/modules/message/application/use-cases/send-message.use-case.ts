import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { SocketGateway } from '../../../socket/socket.gateway';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { MediaFile } from '@/modules/storage/storage.service';
import { MessageMapper } from '../mapper/message.mapper';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { ConversationRepository } from '@/modules/message/infrastructure/repositories/conversation.repository';
import { MessageType } from '@/shared/enum/message-type';

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
    isNewConversation?: boolean,
    type?: string,
  ) {
    const messageOrm = new MessageOrmEntity();
    messageOrm.senderUuid = senderUuid;
    messageOrm.conversationUuid = conversationUuid;
    messageOrm.content = content;
    messageOrm.mediaUrl = JSON.stringify(mediaObject);
    messageOrm.type = (type as MessageType) || MessageType.TEXT;
    console.log('messageOrm', messageOrm);

    const message = await this.messageRepository.create(messageOrm);
    const sender = await this.userRepository.findByUuid(senderUuid);

    await this.conversationRepository.updateField(conversationUuid, 'updatedAt', new Date());
    const conversation = await this.conversationRepository.findByUuid(conversationUuid);

    message.sender = sender;
    message.conversation = conversation;

    const messageDTO = this.messageMapper.toDTO(message, senderUuid);
    console.log('message', messageDTO);

    if (message) {
      const allParticipantsQuery = await this.conversationRepository.findConversationByUuid(conversationUuid);

      const participantUuids: string[] = [];
      if (allParticipantsQuery?.participants) {
        allParticipantsQuery.participants.forEach((participant) => {
          participantUuids.push(participant.userUuid);
        });
      }

      // Nếu không có participants từ relation, thử lấy từ UserConversation table
      if (participantUuids.length === 0) {
        // Fallback: lấy participants từ UserConversation
        const otherParticipants = await this.conversationRepository.getUuidParticipantByUuidConversation(
          conversationUuid,
          senderUuid,
        );
        participantUuids.push(senderUuid); // Thêm sender
        participantUuids.push(...otherParticipants); // Thêm các participants khác
      }

      console.log('Participants found:', participantUuids);

      // Nếu là conversation mới, thông báo cho tất cả participants join room
      if (isNewConversation || participantUuids.length <= 2) {
        participantUuids.forEach((participantUuid) => {
          // Thông báo join room cho conversation mới
          this.socketGateway.sendToUser(participantUuid, 'joinNewConversation', {
            conversationUuid: conversationUuid,
            message: messageDTO,
          });
        });

        setTimeout(() => {
          this.socketGateway.sendToConversation(conversationUuid, 'receiveMessage', messageDTO);
        }, 100);
      } else {
        this.socketGateway.sendToConversation(conversationUuid, 'receiveMessage', messageDTO);
      }

      participantUuids.forEach((participantUuid) => {
        this.socketGateway.sendToUser(participantUuid, 'updateConversation', {
          conversationUuid: conversationUuid,
          userUuid: participantUuid,
          lastMessage: messageDTO,
          updatedAt: conversation.updatedAt,
        });
      });
    }

    return message;
  }
}
