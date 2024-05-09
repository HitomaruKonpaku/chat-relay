import { BaseExternalEntity } from '@shared/base/base-external.entity'
import { Column, Entity, Index } from 'typeorm'
import { YoutubeChannel } from './youtube-channel.entity'

@Entity('youtube_video')
export class YoutubeVideo extends BaseExternalEntity {
  @Index()
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'category_id', type: 'text', nullable: true })
  categoryId?: string

  @Column({ name: 'is_live_content', type: 'boolean', nullable: true })
  isLiveContent?: boolean

  @Column({ name: 'is_members_only', type: 'boolean', nullable: true })
  isMembersOnly?: boolean

  @Column({ name: 'is_live', type: 'boolean', nullable: true })
  isLive?: boolean

  @Column({ name: 'is_upcoming', type: 'boolean', nullable: true })
  isUpcoming?: boolean

  @Column({ name: 'upcoming_at', type: 'numeric', nullable: true })
  upcomingAt?: number

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  @Column({ name: 'scheduled_start_time', type: 'numeric', nullable: true })
  scheduledStartTime?: number

  @Column({ name: 'actual_start_time', type: 'numeric', nullable: true })
  actualStartTime?: number

  @Column({ name: 'actual_end_time', type: 'numeric', nullable: true })
  actualEndTime?: number

  channel?: YoutubeChannel[]
}
