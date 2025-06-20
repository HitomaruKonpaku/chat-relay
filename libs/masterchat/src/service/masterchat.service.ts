import { BaseService } from '@/shared/base/base.service'
import { Injectable } from '@nestjs/common'
import { IsNull } from 'typeorm'
import { MasterchatEntity } from '../model/masterchat.entity'
import { MasterchatRepository } from '../repository/masterchat.repository'

@Injectable()
export class MasterchatService extends BaseService<MasterchatEntity> {
  constructor(
    public readonly repository: MasterchatRepository,
  ) {
    super(repository)
  }

  public async updateById(data: MasterchatEntity) {
    // eslint-disable-next-line no-param-reassign
    data.modifiedAt = data.modifiedAt || Date.now()

    const res = await this.upsert(data, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    })

    await this.update(
      {
        id: data.id,
        createdAt: IsNull(),
      },
      { createdAt: data.modifiedAt },
    )

    return res
  }
}
