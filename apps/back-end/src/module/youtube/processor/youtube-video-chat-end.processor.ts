import { DiscordMessageRelayQueueService } from '@/app/discord'
import { Track, TrackService } from '@/app/track'
import { UserSourceType } from '@/app/user'
import {
  YoutubeVideoChatEndJobData,
  YoutubeVideoUtil,
} from '@/app/youtube'
import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { hideLinkEmbed, hyperlink } from 'discord.js'

@Processor(YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME, {
  // autorun: false,
  concurrency: NumberUtil.parse(process.env.YOUTUBE_VIDEO_CHAT_END_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeVideoChatEndProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatEndProcessor.name)

  constructor(
    private readonly trackService: TrackService,
    private readonly discordMessageRelayQueueService: DiscordMessageRelayQueueService,
  ) {
    super()
  }

  async process(job: Job<YoutubeVideoChatEndJobData>): Promise<any> {
    const res = await this.handle(job)
    await job.updateProgress(100)
    return res.map((v) => v.id)
  }

  protected async handle(job: Job<YoutubeVideoChatEndJobData>) {
    const tracks = await this.fetchTracks(job.data.channel.id)
    if (!tracks.length) {
      return []
    }

    await Promise.allSettled(tracks.map((track) => this.handleTrack(track, job.data)))
    return tracks
  }

  protected async handleTrack(track: Track, data: YoutubeVideoChatEndJobData) {
    if (!data.video.isLive && !track.allowReplay) {
      return
    }
    if (data.video.isMembersOnly && !track.allowMemberChat) {
      return
    }
    if (!data.video.isMembersOnly && !track.allowPublicChat) {
      return
    }

    const link = hyperlink(
      data.video.id,
      hideLinkEmbed(YoutubeVideoUtil.getUrl(data.video.id)),
      [
        data.channel.name || data.channel.id,
        data.video.title || data.video.id,
      ].join('\n'),
    )
    const content = `「${link}」 END: ${data.endReason}`
    await this.queueMsgRelay(track, data, content)
  }

  protected async fetchTracks(hostId: string): Promise<Track[]> {
    const tracks = await this.trackService.findByHostId(
      UserSourceType.YOUTUBE,
      hostId,
    )
    return tracks
  }

  protected async queueMsgRelay(
    track: Track,
    data: YoutubeVideoChatEndJobData,
    content: string,
  ) {
    await this.discordMessageRelayQueueService.add(
      {
        channelId: track.discordChannelId,
        content,
        metadata: {
          source: UserSourceType.YOUTUBE,
          channel: data.channel,
          video: data.video,
          endReason: data.endReason,
        },
      },
    )
  }
}
