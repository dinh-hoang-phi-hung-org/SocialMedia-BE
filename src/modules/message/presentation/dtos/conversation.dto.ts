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

  @IsString()
  @ApiProperty({ description: 'Admin UUID' })
  adminUuid?: string;

  @ApiProperty({ description: 'Is group chat' })
  isGroupChat?: boolean;

  @ApiProperty({ description: 'Users in the conversation', type: [ShortcutUserResponseDto] })
  users?: ShortcutUserResponseDto[];

  @ApiProperty({ description: 'User' })
  user?: ShortcutUserResponseDto;
}

export class GroupChatResponseDto {
  @IsString()
  @ApiProperty({ description: 'Group chat UUID' })
  groupChatUuid: string;

  @IsString()
  @ApiProperty({ description: 'Group chat title' })
  groupChatTitle: string;
}
export class UpdateConversationDto {
  @IsString()
  @ApiProperty({ description: 'Conversation UUID' })
  conversationUuid: string;

  @IsString()
  @ApiProperty({ description: 'Conversation group picture URL' })
  conversationGroupPictureUrl?: string;
}
