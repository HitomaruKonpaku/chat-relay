import { BaseExternalEntity } from '@shared/base/base-external.entity'
import { Membership, SuperChatColor } from 'masterchat'
import { Column, Entity, Index } from 'typeorm'
import { YoutubeVideo } from './youtube-video.entity'

@Entity('youtube_chat_action')
export class YoutubeChatAction extends BaseExternalEntity {
  @Index()
  @Column({ name: 'video_id', type: 'text' })
  videoId: string

  @Index()
  @Column({ name: 'type', type: 'text' })
  type: string

  @Index()
  @Column({ name: 'author_channel_id', type: 'text' })
  authorChannelId: string

  @Column({ name: 'author_name', type: 'text', nullable: true })
  authorName?: string

  @Column({ name: 'author_photo', type: 'text', nullable: true })
  authorPhoto?: string

  @Column({ name: 'is_owner', type: 'boolean', nullable: true })
  isOwner?: boolean

  @Column({ name: 'is_moderator', type: 'boolean', nullable: true })
  isModerator?: boolean

  @Column({ name: 'is_verified', type: 'boolean', nullable: true })
  isVerified?: boolean

  @Column({ name: 'message', type: 'text', nullable: true })
  message?: string

  @Column({ name: 'currency', type: 'text', nullable: true })
  currency?: string

  @Column({ name: 'amount', type: 'numeric', nullable: true })
  amount?: number

  @Column({ name: 'color', type: 'text', nullable: true })
  color?: SuperChatColor

  @Column({ name: 'significance', type: 'numeric', nullable: true })
  significance?: number

  @Column({ name: 'level', type: 'text', nullable: true })
  level?: string

  @Column({ name: 'membership', type: 'json', nullable: true })
  membership?: Membership

  video?: YoutubeVideo
}
