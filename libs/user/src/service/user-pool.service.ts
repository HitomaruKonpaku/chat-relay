import { BaseEntity } from '@/shared/base/base.entity'
import { BaseService } from '@/shared/base/base.service'
import { Injectable } from '@nestjs/common'
import { UserRemove } from '../interface/user-remove.interface'
import { UserPool } from '../model/user-pool.entity'
import { UserPoolRepository } from '../repository/user-pool.repository'

@Injectable()
export class UserPoolService extends BaseService<UserPool> {
  constructor(
    public readonly repository: UserPoolRepository,
  ) {
    super(repository)
  }

  public async add(data: Omit<UserPool, keyof BaseEntity>) {
    await this.repository.add(data)
  }

  public async remove(data: UserRemove) {
    await this.repository.remove(data)
  }
}
