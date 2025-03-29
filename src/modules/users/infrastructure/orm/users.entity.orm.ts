import { Entity, Column } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';

@Entity('users')
export class User extends BaseOrmEntity {
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

  @Column({ type: 'boolean', nullable: true })
  gender: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;
}
