import { UserSourceType } from '@/app/user'
import { BaseEntity } from '@/shared/base/base.entity'
import { Column, Entity, Unique } from 'typeorm'
import { TRACK_UNIQUE_FIELDS } from '../track.constant'

@Entity('track')
@Unique(TRACK_UNIQUE_FIELDS)
export class Track extends BaseEntity {
  @Column({ name: 'discord_channel_id', type: 'varchar' })
  discordChannelId: string

  @Column({ name: 'source_type', type: 'enum', enum: UserSourceType })
  sourceType: UserSourceType

  @Column({ name: 'source_id', type: 'varchar', default: '' })
  sourceId?: string

  @Column({ name: 'filter_id', type: 'varchar', default: '' })
  filterId?: string

  @Column({ name: 'filter_keywords', type: 'json', nullable: true })
  filterKeywords?: string[]

  @Column({ name: 'allow_replay', type: 'boolean', default: false })
  allowReplay?: boolean

  @Column({ name: 'allow_public_chat', type: 'boolean', default: true })
  allowPublicChat?: boolean

  @Column({ name: 'allow_member_chat', type: 'boolean', default: false })
  allowMemberChat?: boolean
}
