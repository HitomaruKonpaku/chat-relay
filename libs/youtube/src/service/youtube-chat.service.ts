import { MasterchatService } from '@/app/masterchat'
import { Logger } from '@/shared/logger/logger'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Bottleneck from 'bottleneck'
import { Action, MasterchatError, YTEmojiRun } from 'masterchat'
import { BaseYoutubeChatActionQueueService } from '../base/base-youtube-chat-action-queue.service'
import { YoutubeChatEmojiJobData } from '../interface/youtube-chat-emoji-job-data.interface'
import { YoutubeChatJobConfig } from '../interface/youtube-chat-job-config.interface'
import { YoutubeChatUtil } from '../util/youtube-chat.util'
import { YoutubeMasterchat } from '../youtube-master-chat'
import { YoutubeChatActionQueueService } from './queue/youtube-chat-action-queue.service'
import { YoutubeChatBannerQueueService } from './queue/youtube-chat-banner-queue.service'
import { YoutubeChatBannerRaidQueueService } from './queue/youtube-chat-banner-raid-queue.service'
import { YoutubeChatBannerRedirectQueueService } from './queue/youtube-chat-banner-redirect-queue.service'
import { YoutubeChatBannerSummaryQueueService } from './queue/youtube-chat-banner-summary-queue.service'
import { YoutubeChatEmojiQueueService } from './queue/youtube-chat-emoji-queue.service'
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
    private readonly youtubeChatBannerSummaryQueueService: YoutubeChatBannerSummaryQueueService,
    private readonly youtubeChatBannerRedirectQueueService: YoutubeChatBannerRedirectQueueService,
    private readonly youtubeChatBannerRaidQueueService: YoutubeChatBannerRaidQueueService,
    private readonly youtubeChatEmojiQueueService: YoutubeChatEmojiQueueService,
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

  private getActionQueueSerivce(action: Action): BaseYoutubeChatActionQueueService | null {
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

    if (YoutubeChatUtil.isErrorAction(action)) {
      return this.youtubeChatErrorQueueService
    }

    if (YoutubeChatUtil.isUnknownAction(action)) {
      return this.youtubeChatUnknownQueueServicee
    }

    const isSuperChat = false
      || YoutubeChatUtil.isAddSuperChatItemAction(action)
      || YoutubeChatUtil.isAddSuperChatTickerAction(action)
    if (isSuperChat) {
      return this.youtubeSuperChatQueueService
    }

    const isMembership = false
      || YoutubeChatUtil.isAddMembershipItemAction(action)
      || YoutubeChatUtil.isAddMembershipTickerAction(action)
      || YoutubeChatUtil.isAddMembershipMilestoneItemAction(action)
      || YoutubeChatUtil.isMembershipGiftPurchaseAction(action)
      || YoutubeChatUtil.isMembershipGiftRedemptionAction(action)
    if (isMembership) {
      return this.youtubeChatMembershipQueueService
    }

    const isPoll = false
      || YoutubeChatUtil.isShowPollPanelActionAction(action)
      || YoutubeChatUtil.isUpdatePollActionAction(action)
      || YoutubeChatUtil.isAddPollResultActionAction(action)
    if (isPoll) {
      return this.youtubeChatPollQueueService
    }

    const isSummaryBanner = false
      || YoutubeChatUtil.isAddChatSummaryBannerAction(action)
    if (isSummaryBanner) {
      return this.youtubeChatBannerSummaryQueueService
    }

    const isRedirectBanner = false
      || YoutubeChatUtil.isAddRedirectBannerAction(action)
    if (isRedirectBanner) {
      return this.youtubeChatBannerRedirectQueueService
    }

    const isRaidBanner = false
      || YoutubeChatUtil.isAddIncomingRaidBannerAction(action)
      || YoutubeChatUtil.isAddOutgoingRaidBannerAction(action)
    if (isRaidBanner) {
      return this.youtubeChatBannerRaidQueueService
    }

    const isBanner = false
      || YoutubeChatUtil.isAddBannerAction(action)
    if (isBanner) {
      return this.youtubeChatBannerQueueService
    }

    return this.youtubeChatQueueService
  }

  private async queueAction(chat: YoutubeMasterchat, action: Action) {
    await this.queueEmojisIfExist(chat, action)

    const service = this.getActionQueueSerivce(action)
    if (!service) {
      return null
    }

    const body = {
      ...YoutubeChatUtil.generateChatMetadata(chat),
      action,
    }

    return service.add(body, chat.config?.jobsOptions)
  }

  private async queueEmojisIfExist(chat: YoutubeMasterchat, action: Action) {
    if (!('message' in action)) {
      return
    }

    const { message } = action
    if (!Array.isArray(message)) {
      return
    }

    const runs = message.filter((v) => 'emoji' in v && v.emoji.emojiId) as YTEmojiRun[]
    if (!runs.length) {
      return
    }

    await Promise.allSettled(runs.map((v) => this.queueEmoji(chat, v)))
  }

  private async queueEmoji(chat: YoutubeMasterchat, run: YTEmojiRun) {
    const data: YoutubeChatEmojiJobData = {
      channel: {
        id: chat.channelId,
        name: chat.channelName,
      },
      emoji: run.emoji,
    }
    return this.youtubeChatEmojiQueueService.add(data)
  }
}
