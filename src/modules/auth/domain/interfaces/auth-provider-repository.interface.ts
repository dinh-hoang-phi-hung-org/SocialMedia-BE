import { AuthProviderOrmEntity } from '@/modules/auth/infrastructure/orm/auth-provider.entity.orm';
export interface IAuthProviderRepository {
  create(authProvider: AuthProviderOrmEntity): Promise<AuthProviderOrmEntity>;
  findByGoogleId(googleId: string): Promise<AuthProviderOrmEntity | null>;
}
