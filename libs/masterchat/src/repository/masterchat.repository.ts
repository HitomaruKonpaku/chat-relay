import { BaseRepository } from '@/shared/base/base.repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MasterchatEntity } from '../model/masterchat.entity'

@Injectable()
export class MasterchatRepository extends BaseRepository<MasterchatEntity> {
  constructor(
    @InjectRepository(MasterchatEntity)
    public readonly repository: Repository<MasterchatEntity>,
  ) {
    super(repository)
  }
}
