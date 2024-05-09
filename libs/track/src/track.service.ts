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

  public async add(data: Omit<Track, keyof BaseEntity>) {
    await this.repository.add(data)
  }

  public async remove(data: TrackRemove) {
    await this.repository.remove(data)
  }
}
