import { UserSourceType } from '@app/user'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntity } from '@shared/base/base.entity'
import { BaseRepository } from '@shared/base/base.repository'
import { Brackets, Repository } from 'typeorm'
import { TrackRemove } from '../interface/track-remove.interface'
import { Track } from '../model/track.entity'
import { TRACK_UNIQUE_FIELDS } from '../track.constant'

@Injectable()
export class TrackRepository extends BaseRepository<Track> {
  constructor(
    @InjectRepository(Track)
    public readonly repository: Repository<Track>,
  ) {
    super(repository)
  }

  public async findByAuthorId(sourceType: UserSourceType, authorId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('source_type = :sourceType', { sourceType })
      .andWhere(new Brackets((qb) => {
        qb
          .orWhere('source_id = :authorId', { authorId })
          .orWhere('filter_id = :authorId', { authorId })
      }))
    const res = await query.getMany()
    return res
  }

  public async add(data: Omit<Track, keyof BaseEntity>) {
    await this.repository.upsert(
      this.repository.create({
        ...data,
        isActive: true,
        updatedAt: Date.now(),
      }),
      TRACK_UNIQUE_FIELDS,
    )
  }

  public async remove(data: TrackRemove) {
    await this.repository.update(data, {
      isActive: false,
      updatedAt: Date.now(),
    })
  }
}
