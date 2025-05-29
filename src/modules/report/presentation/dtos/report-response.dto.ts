import { CommentResponseDto } from '@/modules/comment/presentation/dtos/comment.dto';
import { PostResponseDto } from '@/modules/posts/presentation/dtos/post-reponse.dto';
import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
export class ReportResponseDto {
  @ApiProperty({ description: 'The UUID of the report' })
  uuid: string;

  @ApiProperty({ description: 'The UUID of the reporter' })
  reporterUuid: string;

  @ApiProperty({ description: 'The UUID of the content' })
  contentUuid: string;

  @ApiProperty({ description: 'The type of content' })
  contentType: string;

  @ApiProperty({ description: 'The details of the report' })
  details: string;

  @ApiProperty({ description: 'The created at date' })
  createdAt: string;

  @ApiProperty({ description: 'The reporter' })
  reporter: ShortcutUserResponseDto;

  @ApiProperty({ description: 'The status of the report' })
  status: string;

  @ApiProperty({ description: 'The reviewed at date' })
  reviewedAt: string;
}

export class ReportResponseDtoWithPost {
  @ApiProperty({ description: 'The report' })
  report: ReportResponseDto;

  @ApiProperty({ description: 'The post' })
  post: PostResponseDto;
}

export class ReportResponseDtoWithComment {
  @ApiProperty({ description: 'The report' })
  report: ReportResponseDto;

  @ApiProperty({ description: 'The comment' })
  comment: CommentResponseDto;

  @ApiProperty({ description: 'The parent comment' })
  parentComment?: CommentResponseDto;

  @ApiProperty({ description: 'The post' })
  post: PostResponseDto;
}
