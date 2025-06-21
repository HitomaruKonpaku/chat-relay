import { BaseExternalEntity } from '@/shared/base/base-external.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('masterchat')
export class MasterchatEntity extends BaseExternalEntity {
  @Index()
  @Column({ name: 'channel_id', type: 'text', nullable: true })
  channelId?: string

  @Column({ name: 'started_at', type: 'numeric', nullable: true })
  startedAt?: number

  @Column({ name: 'ended_at', type: 'numeric', nullable: true })
  endedAt?: number

  @Column({ name: 'end_reason', type: 'text', nullable: true })
  endReason?: string

  @Column({ name: 'error_at', type: 'numeric', nullable: true })
  errorAt?: number

  @Column({ name: 'error_code', type: 'text', nullable: true })
  errorCode?: string

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string
}
