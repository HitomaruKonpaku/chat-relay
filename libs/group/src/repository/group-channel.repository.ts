import { BaseRepository } from '@/shared/base/base.repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GroupChannel } from '../model/group-channel.entity'

@Injectable()
export class GroupChannelRepository extends BaseRepository<GroupChannel> {
  constructor(
    @InjectRepository(GroupChannel)
    public readonly repository: Repository<GroupChannel>,
  ) {
    super(repository)
  }
}
