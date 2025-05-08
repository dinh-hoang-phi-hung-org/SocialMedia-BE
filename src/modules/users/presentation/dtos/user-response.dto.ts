import { Gender } from '@/shared/enum/gender';
import { UserRole } from '@/shared/enum/role';

export class UserResponseDto {
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  bio: string;
  dateOfBirth: Date;
  lastLogin: Date;
  gender: Gender;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  followersCount: number;
  followingsCount: number;
  postsCount: number;
  isFollowed?: boolean;
}
