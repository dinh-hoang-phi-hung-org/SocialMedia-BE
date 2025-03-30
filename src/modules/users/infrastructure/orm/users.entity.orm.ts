import { Entity, Column } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { UserRole } from '@/shared/enum/role';
import { Gender } from '@/shared/enum/gender';

@Entity('users')
export class UserOrmEntity extends BaseOrmEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;
}
