import { HolodexService } from '@/app/holodex'
import { UserPoolRepository, UserSourceType } from '@/app/user'
import { InnertubeUtil, YoutubeVideoChatQueueService } from '@/app/youtube'
import { InnertubeService } from '@/app/youtube/service/innertube.service'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Injectable, OnModuleInit } from '@nestjs/common'
import Bottleneck from 'bottleneck'

@Injectable()
export class YoutubeChannelCrawlerService implements OnModuleInit {
  private readonly logger = new Logger(YoutubeChannelCrawlerService.name)

  private readonly limiter = new Bottleneck({ maxConcurrent: 1 })

  private delay = NumberUtil.parse(process.env.YOUTUBE_CHANNEL_CRAWLER_DELAY, 2) * 1000
  private interval = NumberUtil.parse(process.env.YOUTUBE_CHANNEL_CRAWLER_INTERVAL, 60) * 1000

  private readonly holodexActive = BooleanUtil.fromString(process.env.YOUTUBE_CHANNEL_CRAWLER_HOLODEX_ACTIVE)
  private holodexInterval = (NumberUtil.parse(process.env.YOUTUBE_CHANNEL_CRAWLER_HOLODEX_INTERVAL || process.env.YOUTUBE_CHANNEL_CRAWLER_INTERVAL, 60) * 1000)

  constructor(
    private readonly userPoolRepository: UserPoolRepository,
    private readonly youtubeVideoChatQueueService: YoutubeVideoChatQueueService,
    private readonly innertubeService: InnertubeService,
    private readonly holodexService: HolodexService,
  ) { }

  onModuleInit() {
    setTimeout(() => this.onTick(), this.delay)
    setTimeout(() => this.onTickHolodex(), this.delay)
  }

  getHello(): string {
    return 'Hello World!'
  }

  // #region internal

  public async onTick() {
    try {
      await this.fetchChannels()
    } catch (error) {
      this.logger.error(`onTick: ${error.message}`)
    }

    setTimeout(() => this.onTick(), this.interval)
  }

  public async getChannels() {
    const records = await this.userPoolRepository.find(
      {
        sourceType: UserSourceType.YOUTUBE,
      },
      {
        hasMembership: 'DESC',
        createdAt: 'ASC',
      },
    )
    return records
  }

  public async fetchChannels() {
    this.logger.log('fetchChannels -->')
    const channels = await this.getChannels()
    await Promise.allSettled(
      channels.map(
        (channel) => this.limiter.schedule(
          () => this.getChannelVideos(channel.sourceId, channel.hasMembership),
        ),
      ),
    )
    this.logger.log(`fetchChannels <-- ${JSON.stringify({ count: channels.length })}`)
  }

  public async getChannelVideos(id: string, hasMembership = false) {
    try {
      const channel = await this.innertubeService.getChannel(id, hasMembership)
      const videoIds = await this.innertubeService.getChannelActiveVideoIds(id, channel)
      const logData = {
        id,
        hasMembership,
        name: InnertubeUtil.getTitle(channel),
        videoCount: videoIds.length,
        videoIds,
      }
      this.logger.debug(`getChannelVideos --> ${JSON.stringify(logData)}`)
      await Promise.allSettled(videoIds.map((v) => this.queueVideo(v)))
    } catch (error) {
      this.logger.error(`getChannelVideos: ${error.message}`, null, { id })
    }
  }

  // #endregion

  // #region holodex

  public async onTickHolodex() {
    if (!this.holodexActive || !this.holodexService.canActive()) {
      return
    }

    try {
      await this.fetchHolodexChannels()
    } catch (error) {
      this.logger.error(`onTickHolodex: ${error.message}`)
    }

    setTimeout(() => this.onTickHolodex(), this.holodexInterval)
  }

  public async fetchHolodexChannels() {
    this.logger.debug('fetchHolodexChannels -->')
    const channels = await this.getChannels()
    if (!channels.length) {
      return
    }

    const { data: items } = await this.holodexService.client.get<any[]>(
      'users/live',
      { params: { channels: channels.map((v) => v.sourceId).join(',') } },
    )
    const videoIds = items.map((v) => v.id)
    await Promise.allSettled(videoIds.map((v) => this.queueVideo(v)))
    this.logger.debug(`fetchHolodexChannels <-- ${JSON.stringify({ count: channels.length })}`)
  }

  // #endregion

  // #region common

  private async queueVideo(id: string) {
    let job = await this.youtubeVideoChatQueueService.add(id)
    const isFailed = await job.isFailed()
    if (isFailed) {
      await job.remove()
    }
    job = await this.youtubeVideoChatQueueService.add(id)
    return job
  }

  // #endregion
}
