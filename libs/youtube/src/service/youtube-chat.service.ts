import { MasterchatService } from '@/app/masterchat'
import { Logger } from '@/shared/logger/logger'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Bottleneck from 'bottleneck'
import { Action, MasterchatError } from 'masterchat'
import { YoutubeChatJobConfig } from '../interface/youtube-chat-job-config.interface'
import { YoutubeChatUtil } from '../util/youtube-chat.util'
import { YoutubeMasterchat } from '../youtube-master-chat'
import { YoutubeChatActionQueueService } from './queue/youtube-chat-action-queue.service'
import { YoutubeChatBannerQueueService } from './queue/youtube-chat-banner-queue.service'
import { YoutubeChatErrorQueueService } from './queue/youtube-chat-error-queue.service'
import { YoutubeChatMembershipQueueService } from './queue/youtube-chat-membership-queue.service'
import { YoutubeChatPollQueueService } from './queue/youtube-chat-poll-queue.service'
import { YoutubeChatSuperChatQueueService } from './queue/youtube-chat-super-chat-queue.service'
import { YoutubeChatUnknownQueueService } from './queue/youtube-chat-unknown-queue.service'

@Injectable()
export class YoutubeChatService {
  private readonly logger = new Logger(YoutubeChatService.name)

  private readonly httpLimiter = new Bottleneck({
    maxConcurrent: this.configService.get<number>('YOUTUBE_CHAT_HTTP_LIMITER_MAX_CONCURRENT'),
  })

  constructor(
    private readonly configService: ConfigService,
    private readonly youtubeChatErrorQueueService: YoutubeChatErrorQueueService,
    private readonly youtubeChatUnknownQueueServicee: YoutubeChatUnknownQueueService,
    private readonly youtubeChatQueueService: YoutubeChatActionQueueService,
    private readonly youtubeSuperChatQueueService: YoutubeChatSuperChatQueueService,
    private readonly youtubeChatMembershipQueueService: YoutubeChatMembershipQueueService,
    private readonly youtubeChatPollQueueService: YoutubeChatPollQueueService,
    private readonly youtubeChatBannerQueueService: YoutubeChatBannerQueueService,
    private readonly masterchatService: MasterchatService,
  ) { }

  public async init(
    videoId: string,
    applyCredentials: boolean = false,
    config: YoutubeChatJobConfig = {},
  ) {
    const chat = new YoutubeMasterchat(videoId, config, this.httpLimiter)
    if (applyCredentials) {
      chat.applyCredentials()
    }
    await chat.populateMetadata()
    this.addChatListeners(chat)
    return chat
  }

  private addChatListeners(chat: YoutubeMasterchat) {
    chat.on('actions', async (actions) => {
      const queueActions = actions.filter((v: any) => v.id)
      await Promise.allSettled((queueActions).map((action) => this.queueAction(chat, action)))
    })

    chat.on('error', async (error: MasterchatError) => {
      await this.masterchatService.updateById({
        id: chat.videoId,
        isActive: false,
        channelId: chat.channelId,
        errorAt: Date.now(),
        errorCode: error.code,
        errorMessage: error.message,
      })
    })

    chat.on('end', async (reason) => {
      await this.masterchatService.updateById({
        id: chat.videoId,
        isActive: false,
        channelId: chat.channelId,
        endedAt: Date.now(),
        endReason: reason,
        errorAt: null,
        errorCode: null,
        errorMessage: null,
      })
    })
  }

  private queueAction(chat: YoutubeMasterchat, action: Action) {
    const ignoreTypes = [
      'addPlaceholderItemAction',
      'addViewerEngagementMessageAction',
      'showTooltipAction',
      'showPanelAction',
      'closePanelAction',
    ]
    if (ignoreTypes.includes(action.type)) {
      return null
    }

    const body = {
      ...YoutubeChatUtil.generateChatMetadata(chat),
      action,
    }

    if (YoutubeChatUtil.isErrorAction(action)) {
      return this.youtubeChatErrorQueueService.add(body, chat.config?.jobsOptions)
    }

    if (YoutubeChatUtil.isUnknownAction(action)) {
      return this.youtubeChatUnknownQueueServicee.add(body, chat.config?.jobsOptions)
    }

    const isSuperChat = false
      || YoutubeChatUtil.isAddSuperChatItemAction(action)
      || YoutubeChatUtil.isAddSuperChatTickerAction(action)
    if (isSuperChat) {
      return this.youtubeSuperChatQueueService.add(body, chat.config?.jobsOptions)
    }

    const isMembership = false
      || YoutubeChatUtil.isAddMembershipItemAction(action)
      || YoutubeChatUtil.isAddMembershipTickerAction(action)
      || YoutubeChatUtil.isAddMembershipMilestoneItemAction(action)
      || YoutubeChatUtil.isMembershipGiftPurchaseAction(action)
      || YoutubeChatUtil.isMembershipGiftRedemptionAction(action)
    if (isMembership) {
      return this.youtubeChatMembershipQueueService.add(body, chat.config?.jobsOptions)
    }

    const isPoll = false
      || YoutubeChatUtil.isShowPollPanelActionAction(action)
      || YoutubeChatUtil.isUpdatePollActionAction(action)
      || YoutubeChatUtil.isAddPollResultActionAction(action)
    if (isPoll) {
      return this.youtubeChatPollQueueService.add(body, chat.config?.jobsOptions)
    }

    const isBanner = false
      || YoutubeChatUtil.isAddBannerAction(action)
      || YoutubeChatUtil.isAddChatSummaryBannerAction(action)
    if (isBanner) {
      return this.youtubeChatBannerQueueService.add(body, chat.config?.jobsOptions)
    }

    return this.youtubeChatQueueService.add(body, chat.config?.jobsOptions)
  }
}
