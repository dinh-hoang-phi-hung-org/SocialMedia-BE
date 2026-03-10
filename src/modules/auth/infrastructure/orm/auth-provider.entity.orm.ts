import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { AuthProvider } from '@/shared/enum/auth-provider';

@Entity('auth_providers')
@Unique(['provider', 'provider_user_id'])
export class AuthProviderOrmEntity extends BaseOrmEntity {
  @Column({
    type: 'enum',
    enum: AuthProvider,
  })
  provider: AuthProvider;

  @Column()
  provider_user_id: string; // google sub id

  @ManyToOne(() => UserOrmEntity, (user) => user.authProviders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;
}
