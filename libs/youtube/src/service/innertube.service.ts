import { Injectable, OnModuleInit } from '@nestjs/common'
import { NumberUtil } from '@shared/util/number.util'
import Bottleneck from 'bottleneck'
import Innertube from 'youtubei.js'
import { Video } from 'youtubei.js/dist/src/parser/nodes'
import { Channel } from 'youtubei.js/dist/src/parser/youtube'
import { YoutubeChannelRepository } from '../repository/youtube-channel.repository'
import { YoutubeVideoRepository } from '../repository/youtube-video.repository'

@Injectable()
export class InnertubeService implements OnModuleInit {
  private readonly clientLimiter = new Bottleneck({ maxConcurrent: 1 })

  private client: Innertube

  constructor(
    private readonly youtubeChannelRepository: YoutubeChannelRepository,
    private readonly youtubeVideoRepository: YoutubeVideoRepository,
  ) { }

  async onModuleInit() {
    await this.initClient()
  }

  public async getChannel(channelId: string) {
    await this.initClient()
    const channel = await this.client.getChannel(channelId)
    await this.saveChannel(channel)
    return channel
  }

  public async getChannelStreams(channelId: string) {
    const channel = await this.getChannel(channelId)
    const videos = await channel.getLiveStreams()
      .then((v) => [...v.videos] as Video[])
    const res = await Promise.all(videos.map((v) => this.saveVideo(channelId, v)))
    return res
  }

  public async getChannelActiveStreams(channelId: string) {
    const videos = await this.getChannelStreams(channelId)
    const res = videos.filter((v) => v.isLive || v.isUpcoming)
    return res
  }

  private async saveChannel(channel: Channel) {
    const { metadata } = channel
    const res = await this.youtubeChannelRepository.save({
      id: metadata.external_id,
      modifiedAt: Date.now(),
      name: metadata.title,
      description: metadata.description,
      customUrl: metadata.vanity_channel_url?.replace('http://www.youtube.com/', ''),
      thumbnailUrl: metadata.thumbnail[0]?.url?.replace(/=s\d+.*/, '=s0'),
    })
    return res
  }

  private async saveVideo(channelId: string, video: Video) {
    const res = await this.youtubeVideoRepository.save({
      id: video.id,
      modifiedAt: Date.now(),
      channelId,
      isLive: video.is_live,
      isUpcoming: video.is_upcoming,
      upcomingAt: NumberUtil.fromDate(video.upcoming),
      title: video.title.toString(),
      description: video.description,
      thumbnailUrl: video.best_thumbnail?.url,
    })
    return res
  }

  private async initClient() {
    await this.clientLimiter.schedule(async () => {
      this.client = this.client || await Innertube.create({})
    })
  }
}
