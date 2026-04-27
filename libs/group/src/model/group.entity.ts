import { BaseEntity } from '@/shared/base/base.entity'
import { Column, Entity } from 'typeorm'
import { GroupChannel } from './group-channel.entity'

@Entity('group')
export class Group extends BaseEntity {
  @Column({ name: 'parent_id', type: 'varchar', nullable: true })
  parentId?: string

  @Column({ name: 'sort', type: 'int', nullable: true })
  sort?: number

  @Column({ name: 'name', type: 'varchar' })
  name: string

  @Column({ name: 'full_name', type: 'varchar', nullable: true })
  fullName?: string

  @Column({ name: 'en_name', type: 'varchar', nullable: true })
  enName?: string

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string

  groupChannels?: GroupChannel
}
