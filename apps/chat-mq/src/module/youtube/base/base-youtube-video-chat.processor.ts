import { DatabaseInsertQueueService } from '@/app/database-queue'
import { MasterchatEntity, MasterchatService } from '@/app/masterchat'
import { UserPool, UserPoolRepository, UserSourceType } from '@/app/user'
import {
  YoutubeChannel,
  YoutubeChannelUtil,
  YoutubeChatService,
  YoutubeChatUtil,
  YoutubeMasterchat,
  YoutubeVideo,
  YoutubeVideoChatEndQueueService,
  YoutubeVideoChatJobData,
  YoutubeVideoService,
} from '@/app/youtube'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { ConfigService } from '@nestjs/config'
import Bottleneck from 'bottleneck'
import { Job } from 'bullmq'
import { MasterchatError, MembersOnlyError } from 'masterchat'

export abstract class BaseYoutubeVideoChatProcessor extends BaseProcessor {
  protected readonly logger = new Logger(BaseYoutubeVideoChatProcessor.name)

  protected readonly innerTubeLimier = new Bottleneck({ maxConcurrent: 1 })

  constructor(
    protected readonly configService: ConfigService,
    protected readonly databaseInsertQueueService: DatabaseInsertQueueService,
    protected readonly youtubeVideoChatEndQueueService: YoutubeVideoChatEndQueueService,
    protected readonly youtubeVideoService: YoutubeVideoService,
    protected readonly youtubeChatService: YoutubeChatService,
    protected readonly userPoolRepository: UserPoolRepository,
    protected readonly masterchatService: MasterchatService,
  ) {
    super()
  }

  async process(job: Job<YoutubeVideoChatJobData>): Promise<any> {
    await this.log(job, '[INIT]')

    const jobData = job.data
    const { videoId } = jobData
    let userPool: UserPool

    const chat = await this.youtubeChatService.init(videoId, false, jobData.config)
      .catch(async (error) => {
        if (error instanceof MembersOnlyError && error.data?.channelId) {
          userPool = await this.getUserPool(error.data.channelId)
          if (userPool?.hasMembership) {
            // attemp to re-init with has membership
            await this.log(job, '[INIT.CREDENTIALS]')
            return this.youtubeChatService.init(videoId, true, jobData.config)
          }
        }
        throw error
      })
      .then((res) => {
        this.log(job, '[OK]')
        this.onChatInitOk(res)
        return res
      })
      .catch((error) => {
        this.log(job, `[ERROR] ${error.code} - ${error.message}`)
        this.onChatInitError(videoId, error)
        throw error
      })

    await this.updateJobData(job, chat)
    await this.saveChannel(chat)
    await this.saveVideo(chat)

    userPool = userPool || await this.getUserPool(chat.channelId)

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

        await this.updateJobData(job, chat)
        await this.saveVideo(chat)

        await this.log(job, '[LISTEN.ALT]')
        await chat.listen()
      }
    }

    if (endError) {
      throw new MasterchatError(endError.code, `${endError.code} - ${endError.message}`)
    }

    await this.queueVideoChatEnd(job, chat, endReason)

    const res = { endReason }
    await job.updateProgress(100)
    return JSON.parse(JSON.stringify(res))
  }

  protected async onChatInitOk(chat: YoutubeMasterchat) {
    const tmp: MasterchatEntity = {
      id: chat.videoId,
      isActive: true,
      channelId: chat.channelId,
      startedAt: Date.now(),
    }
    if (chat.isLive) {
      tmp.errorAt = null
      tmp.errorCode = null
      tmp.errorMessage = null
    }
    await this.masterchatService.updateById(tmp)
    await this.innerTubeLimier.schedule(() => this.youtubeVideoService.updateMetadataInnertube(chat.videoId, true))
  }

  protected async onChatInitError(id: string, error: any) {
    await this.masterchatService.updateById({
      id,
      isActive: false,
      errorAt: Date.now(),
      errorCode: error.code,
      errorMessage: error.message,
    })
  }

  protected async getUserPool(channelId: string) {
    const res = await this.userPoolRepository.findOne({
      sourceType: UserSourceType.YOUTUBE,
      sourceId: channelId,
      hasMembership: true,
    })
    return res
  }

  protected async saveChannel(mc: YoutubeMasterchat) {
    const data: Partial<YoutubeChannel> = {
      id: mc.channelId,
      modifiedAt: Date.now(),
      name: mc.channelName,
      customUrl: YoutubeChannelUtil.parseCustomUrl(mc.metadata.videoMetadata?.author?.url),
    }
    await this.databaseInsertQueueService.add({ table: 'youtube_channel', data })
  }

  protected async saveVideo(mc: YoutubeMasterchat) {
    const data: Partial<YoutubeVideo> = {
      id: mc.videoId,
      isActive: true,
      createdAt: NumberUtil.fromDate(mc.videoMetadata?.datePublished),
      modifiedAt: Date.now(),
      channelId: mc.channelId,
      isMembersOnly: mc.isMembersOnly,
      title: mc.title,
      actualStart: NumberUtil.fromDate(mc.videoMetadata?.publication?.startDate),
      actualEnd: NumberUtil.fromDate(mc.videoMetadata?.publication?.endDate),
    }
    if (mc.isUpcoming) {
      data.scheduledStart = NumberUtil.fromDate(mc.videoMetadata?.publication?.startDate)
    }
    await this.databaseInsertQueueService.add({ table: 'youtube_video', data })
  }

  protected async updateJobData(job: Job<YoutubeVideoChatJobData>, mc: YoutubeMasterchat) {
    const metadata = YoutubeChatUtil.generateChatMetadata(mc, true)
    const tmp = { ...job.data, ...metadata }
    await job.updateData(tmp)
  }

  protected async queueVideoChatEnd(job: Job<YoutubeVideoChatJobData>, mc: YoutubeMasterchat, endReason: string) {
    const metadata = YoutubeChatUtil.generateChatMetadata(mc, true)
    await this.youtubeVideoChatEndQueueService.add({
      id: mc.videoId,
      endReason,
      ...metadata,
    })
  }
}
