import { Injectable } from '@nestjs/common'
import { BaseService } from '@shared/base/base.service'
import { YoutubeVideo } from '../model/youtube-video.entity'
import { YoutubeVideoRepository } from '../repository/youtube-video.repository'

@Injectable()
export class YoutubeVideoService extends BaseService<YoutubeVideo> {
  constructor(
    public readonly repository: YoutubeVideoRepository,
  ) {
    super(repository)
  }
}
