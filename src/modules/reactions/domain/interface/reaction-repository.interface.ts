import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { ReactionOrmEntity } from '@/modules/reactions/infrastructure/orm/reaction.entity.orm';
export interface IReactionRepository extends IBaseRepository<ReactionOrmEntity> {
  checkIsReacted(contentUuid: string, userUuid: string, contentType: 'post' | 'comment'): Promise<boolean>;
  findByField(field: string, value: string): Promise<ReactionOrmEntity[]>;
  deleteByContentUuidAndUserUuid(contentUuid: string, userUuid: string, contentType: 'post' | 'comment'): Promise<void>;
}
