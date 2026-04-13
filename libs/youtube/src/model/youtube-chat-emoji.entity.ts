import { BaseExternalEntity } from '@/shared/base/base-external.entity'
import { Column, Entity, Index } from 'typeorm'
import { YTThumbnailList } from '../../../../submodule/masterchat/src'
import { YoutubeChannel } from './youtube-channel.entity'

@Entity('youtube_chat_emoji')
export class YoutubeChatEmoji extends BaseExternalEntity {
  @Index()
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'is_custom_emoji', type: 'boolean', nullable: true })
  isCustomEmoji?: boolean

  @Column({ name: 'shortcuts', type: 'text', nullable: true, array: true })
  shortcuts?: string[]

  @Column({ name: 'search_terms', type: 'text', nullable: true, array: true })
  searchTerms?: string[]

  @Column({ name: 'image', type: 'json', nullable: true })
  image?: YTThumbnailList

  channel?: YoutubeChannel
}
