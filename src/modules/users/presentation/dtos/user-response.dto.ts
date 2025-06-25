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
  lastLogin: string;
  gender: Gender;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  followersCount: number;
  followingsCount: number;
  postsCount: number;
  isFollowed?: boolean;
}

export class EditUserDto {
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  bio: string;
  gender: Gender;
  dateOfBirth: Date;
}
