import { UserSourceType } from '@/app/user'
import {
  YoutubeVideoChatEndJobData,
  YoutubeVideoService,
  YoutubeVideoUtil,
} from '@/app/youtube'
import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { hideLinkEmbed, hyperlink } from 'discord.js'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'

@Processor(YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.YOUTUBE_VIDEO_CHAT_END_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeVideoChatEndProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatEndProcessor.name)

  constructor(
    private readonly youtubeVideoService: YoutubeVideoService,
    private readonly youtubeChatHandlerService: YoutubeChatHandlerService,
  ) {
    super()
  }

  async process(job: Job<YoutubeVideoChatEndJobData>): Promise<any> {
    const res = await this.handle(job)
    await job.updateProgress(100)
    return res.map((v) => v.id)
  }

  protected async handle(job: Job<YoutubeVideoChatEndJobData>) {
    const { data } = job
    await this.youtubeVideoService.updateMetadataMasterchat(data.video.id)
    await this.youtubeVideoService.updateMetadataInnertube(data.video.id)

    const content = this.getContent(data)
    const metadata = this.getMetadata(data)

    const res = await this.youtubeChatHandlerService.handleNotification(data, { payload: content, metadata })
    return res
  }

  private getContent(data: YoutubeVideoChatEndJobData): string {
    const link = hyperlink(
      data.video.id,
      hideLinkEmbed(YoutubeVideoUtil.getUrl(data.video.id)),
      [
        data.channel.name || data.channel.id,
        data.video.title || data.video.id,
      ].join('\n'),
    )

    const res = `「${link}」 END: ${data.endReason}`
    return res
  }

  private getMetadata(data: YoutubeVideoChatEndJobData) {
    const res = {
      source: UserSourceType.YOUTUBE,
      channel: data.channel,
      video: data.video,
      endReason: data.endReason,
    }
    return res
  }
}
