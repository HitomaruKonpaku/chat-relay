import { BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn } from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean

  @Column({ name: 'created_at', type: 'numeric', nullable: true })
  createdAt?: number

  @Column({ name: 'updated_at', type: 'numeric', nullable: true })
  updatedAt?: number

  @BeforeInsert()
  onBeforeInsert() {
    this.createdAt = Date.now()
    this.updatedAt = this.updatedAt || this.createdAt
  }

  @BeforeUpdate()
  onBeforeUpdate() {
    this.updatedAt = Date.now()
  }
}
