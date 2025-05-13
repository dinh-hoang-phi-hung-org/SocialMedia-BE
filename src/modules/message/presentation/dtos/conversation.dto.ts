import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MessageResponseDto } from './message.dto';
export class ConversationResponseDto {
  @IsString()
  @ApiProperty({ description: 'Conversation UUID' })
  conversationUuid: string;

  @IsString()
  @ApiProperty({ description: 'Conversation title' })
  conversationTitle: string;

  @IsString()
  @ApiProperty({ description: 'Conversation url' })
  conversationUrl?: string;
}

export class GroupChatResponseDto {
  @IsString()
  @ApiProperty({ description: 'Group chat UUID' })
  groupChatUuid: string;

  @IsString()
  @ApiProperty({ description: 'Group chat title' })
  groupChatTitle: string;
}

export class ConversationsResponseDto {
  @ApiProperty({ description: 'Conversations' })
  conversations: ConversationResponseDto;

  @IsString()
  @ApiProperty({ description: 'Last message' })
  lastMessage: MessageResponseDto;

  @ApiProperty({ description: 'User' })
  user?: ShortcutUserResponseDto;

  @ApiProperty({ description: 'Group chat' })
  groupChat?: GroupChatResponseDto;
}
