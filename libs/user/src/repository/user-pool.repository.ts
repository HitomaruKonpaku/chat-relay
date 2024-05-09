import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntity } from '@shared/base/base.entity'
import { BaseRepository } from '@shared/base/base.repository'
import { Repository } from 'typeorm'
import { UserRemove } from '../interface/user-remove.interface'
import { UserPool } from '../model/user-pool.entity'
import { USER_UNIQUE_FIELDS } from '../user.constant'

@Injectable()
export class UserPoolRepository extends BaseRepository<UserPool> {
  constructor(
    @InjectRepository(UserPool)
    public readonly repository: Repository<UserPool>,
  ) {
    super(repository)
  }

  public async find(filter?: Partial<Omit<UserPool, 'onBeforeInsert' | 'onBeforeUpdate'>>) {
    const res = await this.repository.find({
      where: {
        isActive: true,
        ...filter,
      },
    })
    return res
  }

  public async add(data: Omit<UserPool, keyof BaseEntity>) {
    await this.repository.upsert(
      this.repository.create({
        ...data,
        isActive: true,
        updatedAt: Date.now(),
      }),
      USER_UNIQUE_FIELDS,
    )
  }

  public async remove(data: UserRemove) {
    await this.repository.update(data, {
      isActive: false,
      updatedAt: Date.now(),
    })
  }
}
