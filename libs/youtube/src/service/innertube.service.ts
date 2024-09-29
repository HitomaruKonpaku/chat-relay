import { Logger } from '@/shared/logger/logger'
import { Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { Innertube, Log } from 'youtubei.js'
import {
  CompactVideo,
  GridVideo,
  PlaylistPanelVideo,
  PlaylistVideo,
  ReelItem,
  ShortsLockupView,
  Video,
  WatchCardCompactVideo,
} from 'youtubei.js/dist/src/parser/nodes'
import { Channel } from 'youtubei.js/dist/src/parser/youtube'
import { YoutubeChannelRepository } from '../repository/youtube-channel.repository'
import { InnertubeUtil } from '../util/innertube.util'
import { YoutubeChannelUtil } from '../util/youtube-channel.util'
import { YoutubeVideoUtil } from '../util/youtube-video.util'
import { YoutubeUtil } from '../util/youtube.util'

type InnertubeVideo = CompactVideo
  | GridVideo
  | PlaylistPanelVideo
  | PlaylistVideo
  | ReelItem
  | ShortsLockupView
  | Video
  | WatchCardCompactVideo

@Injectable()
export class InnertubeService {
  private readonly logger = new Logger(InnertubeService.name)

  private readonly clientLimiter = new Bottleneck({ maxConcurrent: 1 })

  private client: Innertube
  private authClient: Innertube

  constructor(
    private readonly youtubeChannelRepository: YoutubeChannelRepository,
  ) {
    Log.setLevel(Log.Level.NONE)
  }

  public async getChannel(channelId: string, hasMembership = false) {
    let channel: Channel
    if (hasMembership) {
      await this.initAuthClient()
      channel = await this.authClient.getChannel(channelId)
    } else {
      await this.initClient()
      channel = await this.client.getChannel(channelId)
    }
    await this.saveChannel(channel)
    return channel
  }

  public async getChannelActiveVideoIds(channelId: string, channel?: Channel, hasMembership = false): Promise<string[]> {
    // eslint-disable-next-line no-param-reassign
    channel = channel || await this.getChannel(channelId, hasMembership)

    const ids: string[] = []
    ids.push(...this.getActiveVideoIds(channel))

    if (channel.has_live_streams) {
      try {
        const res = await channel.getLiveStreams()
        ids.push(...this.getActiveVideoIds(res))
      } catch (error) {
        this.logger.warn(`getChannelActiveVideoIds#live: ${error.message}`, {
          channelId,
          hasMembership,
          name: InnertubeUtil.getTitle(channel),
        })
      }
    }

    const res = [...new Set(ids)]
    return res
  }

  private getActiveVideoIds(channel: Channel): string[] {
    const videos = channel?.videos || []
    const ids = videos
      .filter((v) => this.filterVideo(v))
      .map((v) => v.id)
    return ids
  }

  private filterVideo(video: InnertubeVideo): boolean {
    if (YoutubeVideoUtil.isVideo(video)) {
      if (video.is_upcoming || video.is_live) {
        return true
      }
    }

    if (YoutubeVideoUtil.isGridVideo(video)) {
      if (video.is_upcoming || video.duration?.text === 'LIVE') {
        return true
      }
    }

    return false
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
      if (!this.client) {
        this.client = await Innertube.create()
      }
    })
  }

  private async initAuthClient() {
    await this.clientLimiter.schedule(async () => {
      if (!this.authClient) {
        const credentials = YoutubeUtil.getCredentials()
        const cookie = YoutubeUtil.genCookieString(credentials)
        this.authClient = await Innertube.create({ cookie })
      }
    })
  }
}
