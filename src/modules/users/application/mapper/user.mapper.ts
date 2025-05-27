import { UserResponseDto } from '@/modules/users/presentation/dtos/user-response.dto';
import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { Injectable } from '@nestjs/common';
import { formatTime } from '@/shared/helpers/formatTime';

@Injectable()
export class UserMapper {
  toDTO(user: UserOrmEntity, isFollowed?: boolean): UserResponseDto {
    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
      bio: user.bio,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      role: user.role,
      isActive: user.is_active,
      createdAt: formatTime(user.createdAt),
      lastLogin: formatTime(user.last_login),
      followersCount: user.followers_count,
      followingsCount: user.followings_count,
      postsCount: user.posts_count,
      isFollowed: isFollowed,
    };
  }

  toShortcutDTO(user: UserOrmEntity): ShortcutUserResponseDto {
    return {
      uuid: user.uuid,
      username: user.username,
      profilePictureUrl: user.profile_picture_url,
    };
  }

  toPaginatedDTO(paginatedResult: PaginatedResult<UserOrmEntity>): PaginatedResult<UserResponseDto> {
    return {
      data: paginatedResult.data.map((user) => this.toDTO(user)),
      meta: {
        total: paginatedResult.meta.total,
        page: paginatedResult.meta.page,
        lastPage: paginatedResult.meta.lastPage,
      },
    };
  }
}
