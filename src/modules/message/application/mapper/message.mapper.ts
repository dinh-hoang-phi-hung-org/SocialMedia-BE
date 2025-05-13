import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { Injectable } from '@nestjs/common';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { MessageResponseDto } from '@/modules/message/presentation/dtos/message.dto';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';

@Injectable()
export class MessageMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toDTO(message: MessageOrmEntity, userUuid: string): MessageResponseDto {
    let mediaObject;
    if (message.mediaUrl) {
      try {
        if (typeof message.mediaUrl === 'object') {
          mediaObject = message.mediaUrl;
        } else {
          mediaObject = JSON.parse(message.mediaUrl);
        }
      } catch (error) {
        console.error('Error parsing mediaUrl:', error);
        mediaObject = undefined;
      }
    }

    return {
      conversationUuid: message.conversationUuid,
      messageUuid: message.uuid,
      user: this.userMapper.toShortcutDTO(message.sender),
      isMyMessage: message.senderUuid === userUuid,
      content: message.content,
      mediaUrl: mediaObject,
      createdAt: message.createdAt,
    };
  }

  toPaginatedDTO(
    paginatedResult: PaginatedResult<MessageOrmEntity>,
    userUuid: string,
  ): PaginatedResult<MessageResponseDto> {
    return {
      data: paginatedResult.data.map((message) => this.toDTO(message, userUuid)),
      meta: {
        total: paginatedResult.meta.total,
        page: paginatedResult.meta.page,
        lastPage: paginatedResult.meta.lastPage,
      },
    };
  }
}
