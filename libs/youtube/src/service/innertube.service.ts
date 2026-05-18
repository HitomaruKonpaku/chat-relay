import { Logger } from '@/shared/logger/logger'
import { Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { Innertube, Log, YT } from 'youtubei.js'
import { YoutubeChannelRepository } from '../repository/youtube-channel.repository'
import { InnertubeUtil } from '../util/innertube.util'
import { YoutubeChannelUtil } from '../util/youtube-channel.util'
import { YoutubeUtil } from '../util/youtube.util'

@Injectable()
export class InnertubeService {
  private readonly logger = new Logger(InnertubeService.name)

  private readonly clientLimiter = new Bottleneck({
    maxConcurrent: 1,
  })
  private readonly channelLimiter = new Bottleneck.Group({
    minTime: 500,
  })

  private client: Innertube
  private authClient: Innertube
  private cookies: Record<string, string> = {}

  constructor(
    private readonly youtubeChannelRepository: YoutubeChannelRepository,
  ) {
    Log.setLevel(Log.Level.NONE)
    this.parseCookies()
  }

  public async getChannel(channelId: string, hasMembership = false) {
    let channel: YT.Channel
    if (hasMembership) {
      await this.initAuthClient()
      channel = await this.channelLimiter.key(channelId).schedule(() => this.authClient.getChannel(channelId))
    } else {
      await this.initClient()
      channel = await this.channelLimiter.key(channelId).schedule(() => this.client.getChannel(channelId))
    }
    await this.saveChannel(channel)
    return channel
  }

  public async getChannelActiveVideoIds(channelId: string, channel?: YT.Channel, hasMembership = false): Promise<string[]> {
    // eslint-disable-next-line no-param-reassign
    channel = channel || await this.getChannel(channelId, hasMembership)

    const ids: string[] = []
    ids.push(...InnertubeUtil.findActiveVideoIds(channel))

    if (channel.has_live_streams) {
      try {
        const xChannel = await this.channelLimiter.key(channelId).schedule(() => channel.getLiveStreams())
        ids.push(...InnertubeUtil.findActiveVideoIds(xChannel))
      } catch (error) {
        this.logger.warn(`getChannelActiveVideoIds#getLiveStreams: ${error.message}`, {
          channelId,
          hasMembership,
          name: InnertubeUtil.getTitle(channel),
        })
      }
    }

    if (channel.has_videos) {
      try {
        const xChannel = await this.channelLimiter.key(channelId).schedule(() => channel.getVideos())
        ids.push(...InnertubeUtil.findActiveVideoIds(xChannel))
      } catch (error) {
        this.logger.warn(`getChannelActiveVideoIds#getVideos: ${error.message}`, {
          channelId,
          hasMembership,
          name: InnertubeUtil.getTitle(channel),
        })
      }
    }

    const res = [...new Set(ids)]
    return res
  }

  public async getVideo(videoId: string) {
    await this.initClient()
    const res = await this.client.getBasicInfo(videoId)
    return res
  }

  private async saveChannel(channel: YT.Channel) {
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

  private parseCookies() {
    try {
      const cookies = process.env.YOUTUBE_COOKIE || ''
      this.cookies = cookies.split(/;\s/g).reduce((obj, str) => {
        const [key, value] = str.trim().split(/=/)
        Object.assign(obj, { [key]: value })
        return obj
      }, {})
      this.logger.warn(`parseCookies | ${JSON.stringify({ keys: Object.keys(this.cookies) })}`)
    } catch (error) {
      this.logger.error(`parseCookies: ${error.message}`)
    }
  }

  private async initClient() {
    await this.clientLimiter.schedule(async () => {
      if (!this.client) {
        const cookie = YoutubeUtil.genCookieString({ ...this.cookies })
        this.client = await Innertube.create({ cookie })
      }
    })
  }

  private async initAuthClient() {
    await this.clientLimiter.schedule(async () => {
      if (!this.authClient) {
        const credentials = YoutubeUtil.getCredentials()
        const cookie = YoutubeUtil.genCookieString({ ...this.cookies, ...credentials })
        this.authClient = await Innertube.create({ cookie })
      }
    })
  }
}
