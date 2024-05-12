import { DatabaseInsertQueueService } from '@app/database-queue'
import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME, YoutubeChatMetadata, YoutubeChatService, YoutubeChatUtil, YoutubeVideo } from '@app/youtube'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { QUEUE_MAX_STALLED_COUNT } from '@shared/constant/common.constant'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import { Job } from 'bullmq'
import { MasterchatError } from 'masterchat'

@Processor(YOUTUBE_VIDEO_CHAT_QUEUE_NAME, {
  maxStalledCount: QUEUE_MAX_STALLED_COUNT,
  concurrency: NumberUtil.parse(process.env.YOUTUBE_VIDEO_CHAT_QUEUE_CONCURRENCY, 100),
})
export class YoutubeVideoChatProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatProcessor.name)

  constructor(
    private readonly databaseInsertQueueService: DatabaseInsertQueueService,
    private readonly youtubeChatService: YoutubeChatService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    this.log(job, '[INIT]')
    const jobData = job.data
    const chat = await this.youtubeChatService.init(jobData.videoId)
    const metadata = YoutubeChatUtil.generateChatMetadata(chat)
    Object.assign(jobData, metadata)

    await job.updateData(jobData)
    await this.save(metadata)

    let endError: MasterchatError
    let endReason: string

    chat.on('error', (error: MasterchatError) => {
      this.log(job, `[ERROR] ${error.code} - ${error.message}`)
      endError = error
    })

    chat.on('end', (reason) => {
      this.log(job, `[END] ${reason}`)
      endReason = reason
    })

    chat.on('actions', (actions) => {
      this.log(job, `[ACTIONS] ${actions.length}`)
    })

    this.log(job, '[LISTEN]')
    await chat.listen()

    if (endError) {
      throw endError
    }

    const res = { endReason }
    await job.updateProgress(100)
    return JSON.parse(JSON.stringify(res))
  }

  private async save(metadata: YoutubeChatMetadata) {
    const data: Partial<YoutubeVideo> = {
      id: metadata.video.id,
      isActive: true,
      modifiedAt: Date.now(),
      channelId: metadata.channel.id,
      isLiveContent: metadata.video.metadata?.publication?.isLiveBroadcast,
      isMembersOnly: metadata.video.isMembersOnly,
      isLive: metadata.video.isLive,
      upcomingAt: NumberUtil.fromDate(metadata.video.metadata?.publication?.startDate),
      title: metadata.video.title,
      thumbnailUrl: metadata.video.metadata?.thumbnailUrl,
    }
    await this.databaseInsertQueueService.add({ table: 'youtube_video', data })
  }
}
