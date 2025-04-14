import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { Injectable } from '@nestjs/common';
import { PostResponseDto } from '../../presentation/dtos/post-reponse.dto';
import { PostOrmEntity } from '../../infrastructure/orm/posts.entity.orm';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { MediaFile } from '@/modules/storage/storage.service';

@Injectable()
export class PostMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toDTO(post: PostOrmEntity): PostResponseDto {
    // console.log(post);
    return {
      uuid: post.uuid,
      content: post.content,
      mediaUrl: post.mediaUrl ? (Object(post.mediaUrl) as { images: MediaFile[]; videos: MediaFile[] }) : undefined,
      createdAt: post.createdAt,
      user: post.user ? this.userMapper.toShortcutDTO(post.user) : undefined,
    };
  }

  toPaginatedDTO(paginatedResult: PaginatedResult<PostOrmEntity>): PaginatedResult<PostResponseDto> {
    return {
      data: paginatedResult.data.map((post) => this.toDTO(post)),
      meta: {
        total: paginatedResult.meta.total,
        page: paginatedResult.meta.page,
        lastPage: paginatedResult.meta.lastPage,
      },
    };
  }
}
