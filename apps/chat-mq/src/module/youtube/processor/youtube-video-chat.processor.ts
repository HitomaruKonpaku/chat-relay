import { DatabaseInsertQueueService } from '@app/database-queue'
import { UserPoolRepository, UserSourceType } from '@app/user'
import {
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
  YoutubeChatMetadata,
  YoutubeChatService,
  YoutubeChatUtil,
  YoutubeVideo,
  YoutubeVideoChatEndQueueService,
  YoutubeVideoChatJobData,
} from '@app/youtube'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { QUEUE_MAX_STALLED_COUNT } from '@shared/constant/common.constant'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import { Job } from 'bullmq'
import { MasterchatError } from 'masterchat'

@Processor(YOUTUBE_VIDEO_CHAT_QUEUE_NAME, {
  // autorun: false,
  maxStalledCount: QUEUE_MAX_STALLED_COUNT,
  concurrency: NumberUtil.parse(process.env.YOUTUBE_VIDEO_CHAT_QUEUE_CONCURRENCY, 100),
})
export class YoutubeVideoChatProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatProcessor.name)

  constructor(
    private readonly databaseInsertQueueService: DatabaseInsertQueueService,
    private readonly youtubeVideoChatEndQueueService: YoutubeVideoChatEndQueueService,
    private readonly youtubeChatService: YoutubeChatService,
    private readonly userPoolRepository: UserPoolRepository,
  ) {
    super()
  }

  async process(job: Job<YoutubeVideoChatJobData>): Promise<any> {
    await this.log(job, '[INIT]')
    const jobData = job.data
    const chat = await this.youtubeChatService.init(jobData.videoId)
    const metadata = YoutubeChatUtil.generateChatMetadata(chat, true)
    Object.assign(jobData, metadata)

    await job.updateData(jobData)
    await this.save(metadata)

    const userPool = await this.userPoolRepository.findOne({
      sourceType: UserSourceType.YOUTUBE,
      sourceId: chat.channelId,
      hasMembership: true,
    })

    let endError: MasterchatError
    let endReason: string

    chat.on('error', (error: MasterchatError) => {
      endError = error
      this.log(job, `[ERROR] ${error.code} - ${error.message}`)
    })

    chat.on('end', (reason) => {
      endReason = reason
      this.log(job, `[END] ${reason}`)
    })

    chat.on('actions', (actions) => {
      if (actions.length) {
        this.log(job, `[ACTIONS] ${actions.length}`)
      }
    })

    if (chat.isMembersOnly && userPool?.hasMembership) {
      await this.log(job, '[CREDENTIALS]')
      chat.applyCredentials()
    }

    await this.log(job, '[LISTEN]')
    await chat.listen()

    if (endError && endError.code === 'membersOnly' && !chat.hasCredentials) {
      if (userPool?.hasMembership) {
        endError = null

        await this.log(job, '[CREDENTIALS.ALT]')
        chat.applyCredentials()

        await this.log(job, '[LISTEN.ALT]')
        await chat.listen()
      }
    }

    if (endError) {
      throw new MasterchatError(endError.code, `${endError.code} - ${endError.message}`)
    }

    await this.youtubeVideoChatEndQueueService.add({
      id: jobData.videoId,
      endReason,
      ...metadata,
    })

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
      isLiveContent: metadata.metadata?.publication?.isLiveBroadcast,
      isMembersOnly: metadata.video.isMembersOnly,
      isLive: metadata.video.isLive,
      upcomingAt: NumberUtil.fromDate(metadata.metadata?.publication?.startDate),
      title: metadata.video.title,
      thumbnailUrl: metadata.metadata?.thumbnailUrl,
    }
    await this.databaseInsertQueueService.add({ table: 'youtube_video', data })
  }
}
