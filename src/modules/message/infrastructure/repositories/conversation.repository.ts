import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { ConversationOrmEntity } from '../orm/conversation.entity.orm';
import { UserConversation } from '../orm/user-conversation.entity.orm';
import { v4 as uuidv4 } from 'uuid';
import { IConversationRepository } from '@/modules/message/domain/interfaces/conversation-repository.interface';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
interface CreateConversationParams {
  uuid: string;
  isGroupChat?: boolean;
  title?: string;
  participantIds: string[];
}

@Injectable()
export class ConversationRepository
  extends AbstractRepository<ConversationOrmEntity>
  implements IConversationRepository
{
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,
    @InjectRepository(UserConversation)
    private readonly userConversationRepository: Repository<UserConversation>,
  ) {
    super({
      searchableFields: ['uuid'],
      sortableFields: ['createdAt'],
    });
  }

  async getUuidParticipantByUuidConversation(uuidConversation: string, userId: string): Promise<string[]> {
    const result = await this.userConversationRepository.find({
      where: { conversationUuid: uuidConversation, userUuid: Not(userId) },
    });
    return result.map((uc) => uc.userUuid);
  }
  async findByUuids(uuids: string[]): Promise<ConversationOrmEntity[]> {
    return this.conversationRepository.find({
      where: { uuid: In(uuids) },
      relations: ['participants', 'participants.user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getUuidByUsers(senderId: string, receiverId: string): Promise<ConversationOrmEntity | null> {
    if (senderId === receiverId) {
      const queryBuilder = this.userConversationRepository
        .createQueryBuilder('uc')
        .innerJoinAndSelect('uc.conversation', 'conversation')
        .leftJoinAndSelect('conversation.participants', 'participants')
        .leftJoinAndSelect('participants.user', 'user')
        .where('uc.user_uuid = :userId', { userId: senderId })
        .andWhere('conversation.is_group_chat = :isGroupChat', { isGroupChat: false });

      const userConversations = await queryBuilder.getMany();

      for (const userConv of userConversations) {
        const participantCount = await this.userConversationRepository.count({
          where: { conversationUuid: userConv.conversationUuid },
        });

        if (participantCount === 1) {
          return userConv.conversation;
        }
      }

      return null;
    }

    const queryBuilder = this.userConversationRepository
      .createQueryBuilder('uc1')
      .innerJoin(UserConversation, 'uc2', 'uc1.conversation_uuid = uc2.conversation_uuid')
      .innerJoinAndSelect('uc1.conversation', 'conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('conversation.is_group_chat = :isGroupChat', { isGroupChat: false })
      .andWhere('uc1.user_uuid != uc2.user_uuid') // Ensure different users
      .andWhere(
        '((uc1.user_uuid = :senderId AND uc2.user_uuid = :receiverId) OR (uc1.user_uuid = :receiverId AND uc2.user_uuid = :senderId))',
        { senderId, receiverId },
      );

    const result = await queryBuilder.getOne();

    return result ? result.conversation : null;
  }

  create(entity: ConversationOrmEntity): Promise<ConversationOrmEntity> {
    return this.conversationRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<ConversationOrmEntity>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [conversations, total] = await this.conversationRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: conversations,
      meta: { total, page, lastPage },
    };
  }

  async findByUuid(uuid: string): Promise<ConversationOrmEntity> {
    const conversation = await this.conversationRepository.findOne({
      where: { uuid },
      relations: ['participants', 'participants.user'],
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async findById(id: number): Promise<ConversationOrmEntity> {
    const conversation = await this.conversationRepository.findOne({ where: { id } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async update(uuid: string, entity: ConversationOrmEntity): Promise<ConversationOrmEntity> {
    await this.findByUuid(uuid);

    const updateData: Partial<ConversationOrmEntity> = {};

    if (entity.title !== undefined) updateData.title = entity.title;
    if (entity.isGroupChat !== undefined) updateData.isGroupChat = entity.isGroupChat;
    if (entity.groupPictureUrl !== undefined) updateData.groupPictureUrl = entity.groupPictureUrl;
    if (entity.adminUuid !== undefined) updateData.adminUuid = entity.adminUuid;
    if (entity.updatedAt !== undefined) updateData.updatedAt = entity.updatedAt;

    await this.conversationRepository.update({ uuid }, updateData);
    return this.findByUuid(uuid);
  }

  async updateField(uuid: string, field: string, value: unknown): Promise<void> {
    await this.conversationRepository.update({ uuid }, { [field]: value });
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.conversationRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Conversation with UUID ${uuid} not found`);
    }
  }

  async createConversation(params: CreateConversationParams): Promise<ConversationOrmEntity | null> {
    // Create conversation
    const newConversation = this.conversationRepository.create({
      uuid: params.uuid,
      isGroupChat: params.isGroupChat || false,
      title: params.title,
    });

    const savedConversation = await this.conversationRepository.save(newConversation);

    // Add participants
    for (const userId of params.participantIds) {
      await this.userConversationRepository.save({
        uuid: uuidv4(),
        userUuid: userId,
        conversationUuid: savedConversation.uuid,
      });
    }

    return this.findConversationByUuid(savedConversation.uuid);
  }

  async findConversationByUuid(uuid: string): Promise<ConversationOrmEntity | null> {
    return this.conversationRepository.findOne({
      where: { uuid },
      relations: ['participants', 'participants.user'],
    });
  }

  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    const count = await this.userConversationRepository.count({
      where: {
        userUuid: userId,
        conversationUuid: conversationId,
      },
    });

    return count > 0;
  }

  async findOneToOneConversation(user1Id: string, user2Id: string): Promise<ConversationOrmEntity | null> {
    // Find all 1-1 conversations that user1 is part of
    const user1Conversations = await this.userConversationRepository.find({
      where: { userUuid: user1Id },
      relations: ['conversation'],
    });

    const oneToOneConversationIds = user1Conversations
      .filter((uc) => !uc.conversation.isGroupChat)
      .map((uc) => uc.conversationUuid);

    if (oneToOneConversationIds.length === 0) {
      return null;
    }

    // Find if user2 is part of any of these conversations
    const sharedConversation = await this.userConversationRepository.findOne({
      where: {
        userUuid: user2Id,
        conversationUuid: In(oneToOneConversationIds),
      },
      relations: ['conversation'],
    });

    return sharedConversation ? sharedConversation.conversation : null;
  }

  async getUserConversations(userId: string): Promise<ConversationOrmEntity[]> {
    const userConversations = await this.userConversationRepository.find({
      where: { userUuid: userId },
      relations: ['conversation', 'conversation.participants', 'conversation.participants.user'],
    });

    return userConversations.map((uc) => uc.conversation);
  }

  async getUserConversationsWithPagination(
    userId: string,
    query: SearchOptions,
  ): Promise<PaginatedResult<ConversationOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    const queryBuilder = this.userConversationRepository
      .createQueryBuilder('uc')
      .innerJoinAndSelect('uc.conversation', 'conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('uc.user_uuid = :userId', { userId });

    // Handle search if provided
    if (searchFields && searchFields.length > 0 && searchValue) {
      if (searchFields.includes('all') || searchFields.includes('title')) {
        queryBuilder.andWhere('conversation.title LIKE :searchValue', { searchValue: `%${searchValue}%` });
      }
    }

    // Handle sorting
    if (sortBy && sortBy !== '') {
      if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        queryBuilder.orderBy(`conversation.${sortBy}`, sortDirection === 'ASC' ? 'ASC' : 'DESC');
      } else {
        queryBuilder.orderBy(`uc.${sortBy}`, sortDirection === 'ASC' ? 'ASC' : 'DESC');
      }
    } else {
      queryBuilder.orderBy('conversation.updatedAt', 'DESC');
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [userConversations, total] = await queryBuilder.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    const conversations = userConversations.map((uc) => uc.conversation);

    return {
      data: conversations,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}
