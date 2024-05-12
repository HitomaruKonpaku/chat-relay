import { DatabaseInsertQueueService } from '@app/database-queue'
import { Injectable, OnModuleInit } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import Innertube from 'youtubei.js'
import {
  CompactVideo,
  GridVideo,
  PlaylistPanelVideo,
  PlaylistVideo,
  ReelItem,
  Video,
  WatchCardCompactVideo,
} from 'youtubei.js/dist/src/parser/nodes'
import { Channel } from 'youtubei.js/dist/src/parser/youtube'
import { YoutubeChannelRepository } from '../repository/youtube-channel.repository'
import { YoutubeVideoRepository } from '../repository/youtube-video.repository'
import { YoutubeChannelUtil } from '../util/youtube-channel.util'
import { YoutubeVideoUtil } from '../util/youtube-video.util'

type InnertubeVideo = CompactVideo
  | GridVideo
  | PlaylistPanelVideo
  | PlaylistVideo
  | ReelItem
  | Video
  | WatchCardCompactVideo

@Injectable()
export class InnertubeService implements OnModuleInit {
  private readonly clientLimiter = new Bottleneck({ maxConcurrent: 1 })

  private client: Innertube

  constructor(
    private readonly databaseInsertQueueService: DatabaseInsertQueueService,
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

  public async getChannelActiveVideos(channelId: string, channel?: Channel) {
    // eslint-disable-next-line no-param-reassign
    channel = channel || await this.getChannel(channelId)
    const videos = await Promise.all(channel.videos.map((v) => this.handleVideo(v)))
    return videos.filter((v) => v)
  }

  private async handleVideo(video: InnertubeVideo) {
    if (YoutubeVideoUtil.isVideo(video)) {
      if (video.is_live || video.is_upcoming) {
        return { id: video.id }
      }
    }

    if (YoutubeVideoUtil.isGridVideo(video)) {
      if (video.is_upcoming) {
        return { id: video.id }
      }
    }

    return null
  }

  private async saveChannel(channel: Channel) {
    const { metadata } = channel
    const res = await this.youtubeChannelRepository.save({
      id: metadata.external_id,
      modifiedAt: Date.now(),
      name: metadata.title,
      description: metadata.description,
      customUrl: YoutubeChannelUtil.parseCustomUrl(metadata.vanity_channel_url),
      thumbnailUrl: YoutubeChannelUtil.parseThumbnailUrl(metadata.thumbnail[0]?.url),
    })
    return res
  }

  private async initClient() {
    await this.clientLimiter.schedule(async () => {
      this.client = this.client || await Innertube.create({})
    })
  }
}
