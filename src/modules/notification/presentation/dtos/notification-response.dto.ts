import { ShortcutUserResponseDto } from '@/modules/users/presentation/dtos/shortcut-user-response.dto';

export class NotificationResponseDto {
  uuid: string;
  type: string;
  userUuid: string;
  content: string;
  relatedUuid: string;
  isRead: boolean;
  createdAt: Date;
  userRelated?: ShortcutUserResponseDto;
}
