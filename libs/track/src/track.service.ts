import { UserSourceType } from '@app/user'
import { Injectable } from '@nestjs/common'
import { BaseEntity } from '@shared/base/base.entity'
import { BaseService } from '@shared/base/base.service'
import { TrackRemove } from './interface/track-remove.interface'
import { Track } from './model/track.entity'
import { TrackRepository } from './repository/track.repository'

@Injectable()
export class TrackService extends BaseService<Track> {
  constructor(
    public readonly repository: TrackRepository,
  ) {
    super(repository)
  }

  public async findByHostId(
    sourceType: UserSourceType,
    sourceId: string,
  ) {
    const res = await this.repository.findByHostId(sourceType, sourceId)
    return res
  }

  public async findByAuthorId(
    sourceType: UserSourceType,
    sourceId: string,
    filterId: string = sourceId,
  ) {
    const res = await this.repository.findByAuthorId(sourceType, sourceId, filterId)
    return res
  }

  public async findByFilterAllow(
    sourceType: UserSourceType,
    hostId: string,
    authorId: string,
  ) {
    const res = await this.repository.findByFilterAllow(sourceType, hostId, authorId)
    return res
  }

  public async add(data: Omit<Track, keyof BaseEntity>) {
    await this.repository.add(data)
  }

  public async remove(data: TrackRemove) {
    await this.repository.remove(data)
  }
}
