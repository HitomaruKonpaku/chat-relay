import { DatabaseInsertQueueService } from '@/app/database-queue'
import { MasterchatEntity, MasterchatService } from '@/app/masterchat'
import { UserPoolRepository, UserSourceType } from '@/app/user'
import {
  YoutubeChannel,
  YoutubeChannelUtil,
  YoutubeChatMetadata,
  YoutubeChatService,
  YoutubeChatUtil,
  YoutubeMasterchat,
  YoutubeVideo,
  YoutubeVideoChatEndQueueService,
  YoutubeVideoChatJobData,
} from '@/app/youtube'
import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { MasterchatError } from 'masterchat'

@Processor(YOUTUBE_VIDEO_CHAT_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.YOUTUBE_VIDEO_CHAT_QUEUE_CONCURRENCY, 100),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeVideoChatProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatProcessor.name)

  constructor(
    private readonly databaseInsertQueueService: DatabaseInsertQueueService,
    private readonly youtubeVideoChatEndQueueService: YoutubeVideoChatEndQueueService,
    private readonly youtubeChatService: YoutubeChatService,
    private readonly userPoolRepository: UserPoolRepository,
    private readonly masterchatService: MasterchatService,
  ) {
    super()
  }

  async process(job: Job<YoutubeVideoChatJobData>): Promise<any> {
    await this.log(job, '[INIT]')
    const jobData = job.data
    const chat = await this.youtubeChatService.init(jobData.videoId, jobData.config)
      .then((res) => {
        const tmp: MasterchatEntity = {
          id: res.videoId,
          isActive: true,
          channelId: res.channelId,
          startedAt: Date.now(),
        }
        if (res.isLive) {
          tmp.errorAt = null
          tmp.errorCode = null
          tmp.errorMessage = null
        }
        this.masterchatService.updateById(tmp)
        return res
      })
      .catch((error) => {
        this.masterchatService.updateById({
          id: jobData.videoId,
          isActive: false,
        })
        throw error
      })

    const metadata = YoutubeChatUtil.generateChatMetadata(chat, true)
    Object.assign(jobData, metadata)

    await job.updateData(jobData)
    await this.saveChannel(chat)
    await this.saveVideo(metadata)

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

        await chat.populateMetadata()
        chat.isMembersOnly = true

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

  private async saveChannel(mc: YoutubeMasterchat) {
    const data: Partial<YoutubeChannel> = {
      id: mc.channelId,
      modifiedAt: Date.now(),
      name: mc.channelName,
      customUrl: YoutubeChannelUtil.parseCustomUrl(mc.metadata.videoMetadata.author.url),
    }
    await this.databaseInsertQueueService.add({ table: 'youtube_channel', data })
  }

  private async saveVideo(metadata: YoutubeChatMetadata) {
    const data: Partial<YoutubeVideo> = {
      id: metadata.video.id,
      isActive: true,
      createdAt: NumberUtil.fromDate(metadata.metadata?.datePublished),
      modifiedAt: Date.now(),
      channelId: metadata.channel.id,
      isMembersOnly: metadata.video.isMembersOnly,
      title: metadata.video.title,
      actualStart: NumberUtil.fromDate(metadata.metadata?.publication?.startDate),
      actualEnd: NumberUtil.fromDate(metadata.metadata?.publication?.endDate),
    }
    if (metadata.video.isUpcoming) {
      data.scheduledStart = NumberUtil.fromDate(metadata.metadata?.publication?.startDate)
    }
    await this.databaseInsertQueueService.add({ table: 'youtube_video', data })
  }
}
