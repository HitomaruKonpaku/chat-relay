import { BaseEntity } from '@/shared/base/base.entity'
import { BaseService } from '@/shared/base/base.service'
import { Injectable } from '@nestjs/common'
import { UserRemove } from '../interface/user-remove.interface'
import { UserFilter } from '../model/user-filter.entity'
import { UserFilterRepository } from '../repository/user-filter.repository'

@Injectable()
export class UserFilterService extends BaseService<UserFilter> {
  constructor(
    public readonly repository: UserFilterRepository,
  ) {
    super(repository)
  }

  public async add(data: Omit<UserFilter, keyof BaseEntity>) {
    await this.repository.add(data)
  }

  public async remove(data: UserRemove) {
    await this.repository.remove(data)
  }
}
