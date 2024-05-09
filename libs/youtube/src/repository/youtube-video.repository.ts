import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseRepository } from '@shared/base/base.repository'
import { Repository } from 'typeorm'
import { YoutubeVideo } from '../model/youtube-video.entity'

@Injectable()
export class YoutubeVideoRepository extends BaseRepository<YoutubeVideo> {
  constructor(
    @InjectRepository(YoutubeVideo)
    public readonly repository: Repository<YoutubeVideo>,
  ) {
    super(repository)
  }
}
