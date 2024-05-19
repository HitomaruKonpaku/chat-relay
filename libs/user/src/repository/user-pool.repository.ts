import { USER_UNIQUE_FIELDS } from '@constant/user.constant'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntity } from '@shared/base/base.entity'
import { BaseRepository } from '@shared/base/base.repository'
import { EntityFunction } from '@shared/type/entity-function.type'
import { FindOptionsOrder, Repository } from 'typeorm'
import { UserRemove } from '../interface/user-remove.interface'
import { UserPool } from '../model/user-pool.entity'

@Injectable()
export class UserPoolRepository extends BaseRepository<UserPool> {
  constructor(
    @InjectRepository(UserPool)
    public readonly repository: Repository<UserPool>,
  ) {
    super(repository)
  }

  public async find(
    filter?: Partial<Omit<UserPool, EntityFunction>>,
    order?: FindOptionsOrder<UserPool>,
  ) {
    const res = await this.repository.find({
      where: {
        isActive: true,
        ...filter,
      },
      order,
    })
    return res
  }

  public async findOne(filter?: Partial<Omit<UserPool, EntityFunction>>) {
    const res = await this.repository.findOne({
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
