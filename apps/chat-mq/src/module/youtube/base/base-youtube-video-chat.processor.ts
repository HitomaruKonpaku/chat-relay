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
import { sleep } from '@/shared/util/common.util'
import { NumberUtil } from '@/shared/util/number.util'
import { ConfigService } from '@nestjs/config'
import Bottleneck from 'bottleneck'
import { Job } from 'bullmq'
import { DisabledChatError, Masterchat, MasterchatError, MembersOnlyError } from 'masterchat'

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
    const jobData = job.data
    const { videoId } = jobData
    if (!videoId) {
      await job.updateProgress(100)
      return null
    }

    const cookies = this.configService.get<string>('YOUTUBE_COOKIE')
    let userPool: UserPool
    let withCredentials = false
    let endError: MasterchatError | Error
    let endReason: string

    const getUserPool = async (channelId: string) => userPool
      || this.getUserPool(channelId).catch(() => null)

    await this.log(job, '[INIT]')
    const chat: YoutubeMasterchat = await this.youtubeChatService.init(videoId, {
      initValue: {
        channelId: jobData.channel?.id,
        channelName: jobData.channel?.name,
        title: jobData.video?.title,
        isLive: jobData.video?.isLive,
        isUpcoming: jobData.video?.isUpcoming,
        isMembersOnly: jobData.video?.isMembersOnly,
        videoMetadata: jobData.metadata,
      },
      cookies,
      withCredentials,
      config: jobData.config,
    })
      .catch(async (error) => {
        if (error instanceof MembersOnlyError && error.data?.channelId) {
          userPool = await getUserPool(error.data.channelId)
          if (userPool?.hasMembership) {
            withCredentials = true
            await this.log(job, '[INIT.CREDENTIALS]')
            // attemp to re-init with membership
            const res = await this.youtubeChatService.init(videoId, {
              cookies,
              withCredentials,
              config: jobData.config,
            })
            return res
          }
        }
        throw error
      })
      .then(async (res) => {
        await this.log(job, '[INIT.OK]')
        await this.log(job, '[INIT.DONE]')
        this.onChatInitOk(res, res.didPopulateMetadata)
        return res
      })
      .catch((error) => {
        this.log(job, `[ERROR] ${error.code} | ${error.message}`)

        this.onChatInitError(videoId, error)

        if (error instanceof MembersOnlyError) {
          const data = error.data?.data
          if (data) {
            const mc = new Masterchat(videoId, data.channelId)
            mc.channelName = data.channelName
            mc.title = data.title
            mc.isLive = data.isLive
            mc.isUpcoming = data.isUpcoming
            mc.isMembersOnly = data.isMembersOnly
            mc.videoMetadata = data.metadata
            const fakeChat = mc as YoutubeMasterchat
            Promise.allSettled([
              this.updateJobData(job, fakeChat),
              this.saveChannel(fakeChat),
              this.saveVideo(fakeChat),
            ])
          }
        }

        if (error instanceof DisabledChatError) {
          this.safeRemove(job)
        }

        throw error
      })

    if (chat.didPopulateMetadata) {
      await Promise.all([
        this.updateJobData(job, chat),
        this.saveChannel(chat),
        this.saveVideo(chat),
      ])
    }

    userPool = await getUserPool(chat.channelId)

    chat.on('error', (error) => {
      endError = error

      if (error instanceof DisabledChatError) {
        if (chat.isMembersOnly) {
          endError = new MasterchatError('membersOnly', error.message, {
            channelId: chat.channelId,
            data: {
              title: chat.title,
              channelId: chat.channelId,
              channelName: chat.channelName,
              isLive: chat.isLive,
              isUpcoming: chat.isUpcoming,
              isMembersOnly: chat.isMembersOnly,
              metadata: chat.videoMetadata,
            },
          })
        }
      }

      if (endError instanceof MasterchatError) {
        this.log(job, `[ERROR] ${endError.code} | ${endError.message}`)
      } else {
        this.log(job, `[ERROR] ${endError.message}`)
      }
    })

    chat.on('end', (reason) => {
      endReason = reason
      this.log(job, `[END] ${reason}`)
    })

    chat.on('actions', (actions) => {
      if (!actions.length) {
        return
      }
      this.log(job, `[ACTIONS] ${actions.length}`)
    })

    if (chat.isMembersOnly && !withCredentials && userPool?.hasMembership) {
      await this.log(job, '[CREDENTIALS]')
      chat.applyCredentials()
    }

    await this.log(job, '[LISTEN]')
    await chat.listen()

    if (endError && endError instanceof MasterchatError && endError.code === 'membersOnly' && !chat.hasCredentials && userPool?.hasMembership) {
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

    if (endError) {
      throw endError
    }

    await this.queueVideoChatEnd(job, chat, endReason)

    const res = { endReason }
    await job.updateProgress(100)
    return JSON.parse(JSON.stringify(res))
  }

  protected async onChatInitOk(chat: YoutubeMasterchat, fetchInnertube = false) {
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

    if (fetchInnertube) {
      await this.innerTubeLimier.schedule(() => this.youtubeVideoService.updateMetadataInnertube(chat.videoId, true))
    }
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

  protected async updateJobData(job: Job<YoutubeVideoChatJobData>, mc: YoutubeMasterchat, extra: Record<string, any> = {}) {
    const metadata = YoutubeChatUtil.generateChatMetadata(mc, true)
    const data = {
      ...job.data,
      ...extra,
      ...metadata,
    }
    await job.updateData(data)
  }

  protected async queueVideoChatEnd(job: Job<YoutubeVideoChatJobData>, mc: YoutubeMasterchat, endReason: string) {
    const metadata = YoutubeChatUtil.generateChatMetadata(mc, true)
    await this.youtubeVideoChatEndQueueService.add({
      id: mc.videoId,
      endReason,
      ...metadata,
    })
  }

  protected async safeRemove(job: Job<YoutubeVideoChatJobData>) {
    await sleep(5000)

    const state = await job.getState()
    if (!(state === 'failed' || state === 'delayed')) {
      return
    }

    await job.remove({ removeChildren: true })
      .then(() => {
        debugger
      })
      .catch((error) => {
        this.log(job, `[REMOVE] ${error.message}`)
      })
  }
}
