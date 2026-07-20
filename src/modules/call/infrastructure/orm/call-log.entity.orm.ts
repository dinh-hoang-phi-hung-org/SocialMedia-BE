import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

export enum CallLogStatus {
  RINGING = 'ringing',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  DECLINED = 'declined',
  MISSED = 'missed',
}

export enum CallLogType {
  VOICE = 'voice',
  VIDEO = 'video',
}

@Entity('call_logs')
export class CallLogOrmEntity extends BaseOrmEntity {
  @Index()
  @Column({ name: 'conversation_uuid' })
  conversationUuid: string;

  @Index()
  @Column({ name: 'room_name' })
  roomName: string;

  @Column({ name: 'caller_uuid' })
  callerUuid: string;

  @Column({ name: 'ended_by_uuid', nullable: true })
  endedByUuid: string;

  @Column({ name: 'call_type', type: 'enum', enum: CallLogType })
  callType: CallLogType;

  @Column({ type: 'enum', enum: CallLogStatus, default: CallLogStatus.RINGING })
  status: CallLogStatus;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @ManyToOne(() => ConversationOrmEntity)
  @JoinColumn({ name: 'conversation_uuid', referencedColumnName: 'uuid' })
  conversation: ConversationOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'caller_uuid', referencedColumnName: 'uuid' })
  caller: UserOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'ended_by_uuid', referencedColumnName: 'uuid' })
  endedBy: UserOrmEntity;
}
