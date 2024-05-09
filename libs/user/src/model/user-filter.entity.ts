import { BaseEntity } from '@shared/base/base.entity'
import { Column, Entity, Unique } from 'typeorm'
import { UserFilterType } from '../enum/user-filter-type.enum'
import { UserSourceType } from '../enum/user-source-type.enum'
import { USER_UNIQUE_FIELDS } from '../user.constant'

@Entity('user_filter')
@Unique(USER_UNIQUE_FIELDS)
export class UserFilter extends BaseEntity {
  @Column({ name: 'source_type', type: 'enum', enum: UserSourceType })
  sourceType: UserSourceType

  @Column({ name: 'source_id', type: 'varchar' })
  sourceId: string

  @Column({ name: 'type', type: 'enum', enum: UserFilterType })
  type: UserFilterType
}
