import { USER_UNIQUE_FIELDS } from '@constant/user.constant'
import { BaseEntity } from '@shared/base/base.entity'
import { Column, Entity, Unique } from 'typeorm'
import { UserSourceType } from '../enum/user-source-type.enum'

@Entity('user_pool')
@Unique(USER_UNIQUE_FIELDS)
export class UserPool extends BaseEntity {
  @Column({ name: 'source_type', type: 'enum', enum: UserSourceType })
  sourceType: UserSourceType

  @Column({ name: 'source_id', type: 'varchar' })
  sourceId: string

  @Column({ name: 'has_membership', type: 'boolean', default: false })
  hasMembership?: boolean
}
