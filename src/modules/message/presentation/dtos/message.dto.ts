import { IsBoolean, IsNotEmpty, IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';
import { MediaFile } from '@/modules/storage/storage.service';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Content of the message', required: true })
  content: string;

  @IsString()
  @ApiProperty({ description: 'Conversation UUID' })
  @IsOptional()
  conversationUuid?: string;

  @IsString()
  @ApiProperty({ description: 'Receiver UUID' })
  receiverUuid: string;

  @IsString()
  @ApiProperty({ description: 'Type of message' })
  type: string;
}

export class MessageResponseDto {
  @IsString()
  @ApiProperty({ description: 'Conversation UUID' })
  conversationUuid: string;

  @IsString()
  @ApiProperty({ description: 'Message UUID' })
  messageUuid: string;

  @ApiProperty({ description: 'User' })
  user: ShortcutUserResponseDto;

  @IsBoolean()
  @ApiProperty({ description: 'Is the message sent by the current user' })
  isMyMessage: boolean;

  @IsString()
  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Media URL' })
  mediaUrl?: {
    images: MediaFile[];
    videos: MediaFile[];
  };

  @IsDate()
  @ApiProperty({ description: 'Message date' })
  createdAt: Date;

  @IsBoolean()
  @ApiProperty({ description: 'Is the message seen' })
  isSeen?: boolean;

  @IsString()
  @ApiProperty({ description: 'Message type' })
  type: string;
}
