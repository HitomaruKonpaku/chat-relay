import { BaseService } from '@/shared/base/base.service'
import { Injectable } from '@nestjs/common'
import { YoutubeChannel } from '../model/youtube-channel.entity'
import { YoutubeChannelRepository } from '../repository/youtube-channel.repository'

@Injectable()
export class YoutubeChannelService extends BaseService<YoutubeChannel> {
  constructor(
    public readonly repository: YoutubeChannelRepository,
  ) {
    super(repository)
  }
}
