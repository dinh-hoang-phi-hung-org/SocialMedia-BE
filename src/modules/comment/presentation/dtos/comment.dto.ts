import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';
import { MediaFile } from '@/modules/storage/storage.service';
export class PostCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The content of the comment' })
  content: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The parent comment uuid' })
  parentUuid?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The post uuid' })
  postUuid: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'The uuid of the comment' })
  uuid: string;

  @ApiProperty({ description: 'The content of the comment' })
  content: string;

  user?: ShortcutUserResponseDto;

  createdAt: Date;

  @ApiProperty({ description: 'The parent uuid of the comment' })
  parentUuid: string;

  mediaUrl?: {
    images: MediaFile[];
    videos: MediaFile[];
  };
}
