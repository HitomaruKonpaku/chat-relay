import { UserPoolRepository, UserSourceType } from '@app/user'
import { InnertubeUtil, YoutubeVideoChatQueueService } from '@app/youtube'
import { InnertubeService } from '@app/youtube/service/innertube.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import Bottleneck from 'bottleneck'

@Injectable()
export class YoutubeChannelCrawlerService implements OnModuleInit {
  private readonly logger = new Logger(YoutubeChannelCrawlerService.name)

  private readonly limiter = new Bottleneck({ maxConcurrent: 1 })

  private delay = NumberUtil.parse(process.env.YOUTUBE_CHANNEL_CRAWLER_DELAY, 2) * 1000
  private interval = NumberUtil.parse(process.env.YOUTUBE_CHANNEL_CRAWLER_INTERVAL, 60) * 1000

  constructor(
    private readonly userPoolRepository: UserPoolRepository,
    private readonly youtubeVideoChatQueueService: YoutubeVideoChatQueueService,
    private readonly innertubeService: InnertubeService,
  ) { }

  onModuleInit() {
    setTimeout(() => this.onTick(), this.delay)
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

    setTimeout(() => this.onTick(), this.interval)
  }

  public async getChannels() {
    const records = await this.userPoolRepository.find({
      sourceType: UserSourceType.YOUTUBE,
    })
    return records
  }

  public async fetchChannels() {
    this.logger.debug('fetchChannels')
    const channels = await this.getChannels()
    await Promise.allSettled(
      channels.map(
        (channel) => this.limiter.schedule(
          () => this.getChannelVideos(channel.sourceId, channel.hasMembership),
        ),
      ),
    )
  }

  public async getChannelVideos(id: string, hasMembership = false) {
    try {
      const channel = await this.innertubeService.getChannel(id, hasMembership)
      const videos = await this.innertubeService.getChannelActiveVideos(id, channel)
      const logData = {
        id,
        hasMembership,
        name: InnertubeUtil.getTitle(channel),
        videoCount: videos.length,
        videoIds: videos.map((v) => v.id),
      }
      this.logger.debug(`getChannelVideos >>> ${JSON.stringify(logData)}`)
      await Promise.allSettled(videos.map((v) => this.queueVideo(v.id)))
    } catch (error) {
      this.logger.error(`getChannelVideos: ${error.message}`, null, { id })
    }
  }

  private async queueVideo(id: string) {
    let job = await this.youtubeVideoChatQueueService.add(id)
    const isFailed = await job.isFailed()
    if (isFailed) {
      await job.remove()
    }
    job = await this.youtubeVideoChatQueueService.add(id)
    return job
  }
}
