import { MediaFile } from '@/modules/storage/storage.service';
import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';

export class PostResponseDto {
  uuid: string;
  content: string;
  mediaUrl?: {
    images: MediaFile[];
    videos: MediaFile[];
  };
  createdAt: Date;
  user?: ShortcutUserResponseDto;
  commentsCount: number;
  reactionsCount: number;
  isReacted: boolean;
  isSaved: boolean;
}
