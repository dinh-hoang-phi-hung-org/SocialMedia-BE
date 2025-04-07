import { Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

export abstract class BaseOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'uuid', type: 'uuid', generated: 'uuid' })
  uuid: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;
}
