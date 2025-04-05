import { Gender } from '@/shared/enum/gender';
import { UserRole } from '@/shared/enum/role';

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  bio: string;
  dateOfBirth: Date;
  gender: Gender;
  role: UserRole;
}
