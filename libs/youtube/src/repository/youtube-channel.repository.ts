import { BaseRepository } from '@/shared/base/base.repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { YoutubeChannel } from '../model/youtube-channel.entity'

@Injectable()
export class YoutubeChannelRepository extends BaseRepository<YoutubeChannel> {
  constructor(
    @InjectRepository(YoutubeChannel)
    public readonly repository: Repository<YoutubeChannel>,
  ) {
    super(repository)
  }
}
