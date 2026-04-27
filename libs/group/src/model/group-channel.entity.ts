import { BaseEntity } from '@/shared/base/base.entity'
import { Column, Entity, Index, Unique } from 'typeorm'
import { UserSourceType } from '../../../user/src'
import { GROUP_UNIQUE_FIELDS } from '../group.constant'
import { Group } from './group.entity'

@Entity('group_channel')
@Unique(GROUP_UNIQUE_FIELDS)
export class GroupChannel extends BaseEntity {
  @Index()
  @Column({ name: 'group_id', type: 'text' })
  groupId: string

  @Column({ name: 'type', type: 'enum', enum: UserSourceType })
  type: UserSourceType

  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Column({ name: 'sort', type: 'int', nullable: true })
  sort?: number

  group?: Group
}
