import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { AuthProviderOrmEntity } from '@/modules/auth/infrastructure/orm/auth-provider.entity.orm';
import { IAuthProviderRepository } from '../../domain/interfaces/auth-provider-repository.interface';
import { AuthProvider } from '@/shared/enum/auth-provider';
@Injectable()
export class AuthProviderRepository
  extends AbstractRepository<AuthProviderOrmEntity>
  implements IAuthProviderRepository
{
  constructor(
    @InjectRepository(AuthProviderOrmEntity)
    private readonly authProviderRepository: Repository<AuthProviderOrmEntity>,
  ) {
    super({
      searchableFields: ['provider', 'user_id'],
      sortableFields: ['createdAt'],
    });
  }
  create(authProvider: AuthProviderOrmEntity): Promise<AuthProviderOrmEntity> {
    return this.authProviderRepository.save(authProvider);
  }
  async findByGoogleId(googleId: string): Promise<AuthProviderOrmEntity | null> {
    return await this.authProviderRepository.findOne({
      where: { provider: AuthProvider.GOOGLE, provider_user_id: googleId },
      relations: ['user'],
    });
  }
}
