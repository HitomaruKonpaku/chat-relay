import { BaseExternalEntity } from '@/shared/base/base-external.entity'
import { Column, Entity, Index } from 'typeorm'
import { YoutubeChannel } from './youtube-channel.entity'

@Entity('youtube_video')
export class YoutubeVideo extends BaseExternalEntity {
  @Index()
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'is_members_only', type: 'boolean', nullable: true })
  isMembersOnly?: boolean

  @Column({ name: 'is_live_content', type: 'boolean', nullable: true })
  isLiveContent?: boolean

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'scheduled_start', type: 'numeric', nullable: true })
  scheduledStart?: number

  @Column({ name: 'actual_start', type: 'numeric', nullable: true })
  actualStart?: number

  @Column({ name: 'actual_end', type: 'numeric', nullable: true })
  actualEnd?: number

  channel?: YoutubeChannel[]
}
