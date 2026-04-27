import { BaseRepository } from '@/shared/base/base.repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Group } from '../model/group.entity'

@Injectable()
export class GroupRepository extends BaseRepository<Group> {
  constructor(
    @InjectRepository(Group)
    public readonly repository: Repository<Group>,
  ) {
    super(repository)
  }
}
