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

  public async findByHostId(
    sourceType: UserSourceType,
    sourceId: string,
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('source_type = :sourceType', { sourceType })
      .andWhere('source_id = :sourceId AND filter_id = :filterEmpty', { sourceId, filterEmpty: '' })
    const res = await query.getMany()
    return res
  }

  public async findByAuthorId(
    sourceType: UserSourceType,
    sourceId: string,
    filterId: string = sourceId,
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('source_type = :sourceType', { sourceType })
      .andWhere(new Brackets((qb) => {
        qb
          .orWhere('source_id = :sourceId', { sourceId })
          .orWhere('filter_id = :filterId', { filterId })
      }))
    const res = await query.getMany()
    return res
  }

  public async findByFilterAllow(
    sourceType: UserSourceType,
    hostId: string,
    authorId: string,
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('source_type = :sourceType', { sourceType })
      .andWhere(new Brackets((qb) => {
        qb
          .orWhere('source_id = :sourceId AND filter_id = :filterEmpty', { sourceId: hostId, filterEmpty: '' })
          .orWhere('filter_id = :filterId AND source_id = :sourceEmpty', { filterId: authorId, sourceEmpty: '' })
      }))
    const res = await query.getMany()
    return res
  }

  public async add(data: Omit<Track, keyof BaseEntity> & Partial<BaseEntity>) {
    await this.repository.upsert(
      this.repository.create({
        isActive: true,
        updatedAt: Date.now(),
        ...data,
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
