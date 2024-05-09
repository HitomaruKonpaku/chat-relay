import { UserPoolRepository, UserSourceType } from '@app/user'
import { YoutubeVideoChatQueueService } from '@app/youtube'
import { InnertubeService } from '@app/youtube/service/innertube.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Logger } from '@shared/logger/logger'
import Bottleneck from 'bottleneck'

@Injectable()
export class YoutubeChannelCrawlerService implements OnModuleInit {
  private readonly logger = new Logger(YoutubeChannelCrawlerService.name)

  private readonly limiter = new Bottleneck({ maxConcurrent: 1 })

  constructor(
    private readonly userPoolRepository: UserPoolRepository,
    private readonly youtubeVideoChatQueueService: YoutubeVideoChatQueueService,
    private readonly innertubeService: InnertubeService,
  ) { }

  onModuleInit() {
    setTimeout(() => this.onTick(), 2500)
  }

  getHello(): string {
    return 'Hello World!'
  }

  public async onTick() {
    try {
      await this.fetchChannels()
    } catch (error) {
      this.logger.error(`onTick: ${error.message}`)
    }

    setTimeout(() => this.onTick(), 2 * 60 * 1000)
  }

  public async getChannelIds() {
    const records = await this.userPoolRepository.find({ sourceType: UserSourceType.YOUTUBE })
    const ids = records.map((v) => v.sourceId)
    return ids
  }

  public async fetchChannels() {
    this.logger.debug('fetchChannels')
    const ids = await this.getChannelIds()
    await Promise.allSettled(ids.map((id) => this.limiter.schedule(() => this.getChannelStreams(id))))
  }

  public async getChannelStreams(id: string) {
    try {
      const videos = await this.innertubeService.getChannelActiveStreams(id)
      this.logger.debug('getChannelStreams', { id, videoIds: videos.map((v) => v.id) })
      await Promise.allSettled(videos.map((v) => this.youtubeVideoChatQueueService.add(v.id)))
    } catch (error) {
      this.logger.error(`getChannelStreams: ${error.message}`, null, { id })
    }
  }
}
