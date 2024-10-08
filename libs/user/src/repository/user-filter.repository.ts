import { USER_UNIQUE_FIELDS } from '@/constant/user.constant'
import { BaseEntity } from '@/shared/base/base.entity'
import { BaseRepository } from '@/shared/base/base.repository'
import { EntityFunction } from '@/shared/type/entity-function.type'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserRemove } from '../interface/user-remove.interface'
import { UserFilter } from '../model/user-filter.entity'

@Injectable()
export class UserFilterRepository extends BaseRepository<UserFilter> {
  constructor(
    @InjectRepository(UserFilter)
    public readonly repository: Repository<UserFilter>,
  ) {
    super(repository)
  }

  public async findOne(filter?: Partial<Omit<UserFilter, EntityFunction>>) {
    const res = await this.repository.findOne({
      where: {
        isActive: true,
        ...filter,
      },
    })
    return res
  }

  public async add(data: Omit<UserFilter, keyof BaseEntity>) {
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
