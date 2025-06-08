import { Module } from '@nestjs/common';
import { ReactionController } from './presentation/controller/reaction.controller';
import { ReactionRepository } from './infrastructure/repository/reaction.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionOrmEntity } from './infrastructure/orm/reaction.entity.orm';
import { CreateReactionUseCase } from './application/usecases/create-reaction.use-case';
import { CheckIsReactedUseCase } from './application/usecases/check-is-react.use-case';
import { DeleteReactionUseCase } from './application/usecases/delete-reaction.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionOrmEntity])],
  controllers: [ReactionController],
  providers: [
    ReactionRepository,
    CreateReactionUseCase,
    CheckIsReactedUseCase,
    DeleteReactionUseCase,
    {
      provide: 'IReactionRepository',
      useExisting: ReactionRepository,
    },
  ],
  exports: [ReactionRepository, TypeOrmModule.forFeature([ReactionOrmEntity]), 'IReactionRepository'],
})
export class ReactionsModule {}
