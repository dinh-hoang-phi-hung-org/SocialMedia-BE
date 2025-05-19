import { Injectable } from '@nestjs/common';
import { CommentOrmEntity } from '../../infrastructure/orm/comment.entity.orm';
import { CommentResponseDto } from '../../presentation/dtos/comment.dto';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { MediaFile } from '@/modules/storage/storage.service';
@Injectable()
export class CommentMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toDTO(comment: CommentOrmEntity): CommentResponseDto {
    return {
      uuid: comment.uuid,
      content: comment.content,
      user: comment.user ? this.userMapper.toShortcutDTO(comment.user) : undefined,
      createdAt: comment.createAt,
      parentUuid: comment.parentUuid,
      mediaUrl: comment.mediaUrl
        ? (Object(comment.mediaUrl) as { images: MediaFile[]; videos: MediaFile[] })
        : undefined,
    };
  }

  toPaginatedDTO(paginatedResult: PaginatedResult<CommentOrmEntity>): PaginatedResult<CommentResponseDto> {
    return {
      data: paginatedResult.data.map((comment) => this.toDTO(comment)),
      meta: {
        total: paginatedResult.meta.total,
        page: paginatedResult.meta.page,
        lastPage: paginatedResult.meta.lastPage,
      },
    };
  }
}
