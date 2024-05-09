import { Column, PrimaryColumn } from 'typeorm'

export abstract class BaseExternalEntity {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean

  @Column({ name: 'created_at', type: 'numeric', nullable: true })
  createdAt?: number

  @Column({ name: 'updated_at', type: 'numeric', nullable: true })
  updatedAt?: number

  @Column({ name: 'modified_at', type: 'numeric', nullable: true })
  modifiedAt?: number
}
