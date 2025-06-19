import { Logger } from '@/shared/logger/logger'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Bottleneck from 'bottleneck'
import { Action } from 'masterchat'
import { YoutubeChatJobConfig } from '../interface/youtube-chat-job-config.interface'
import { YoutubeChatUtil } from '../util/youtube-chat.util'
import { YoutubeMasterchat } from '../youtube-master-chat'
import { YoutubeChatActionQueueService } from './queue/youtube-chat-action-queue.service'
import { YoutubeChatBannerQueueService } from './queue/youtube-chat-banner-queue.service'
import { YoutubeChatMembershipQueueService } from './queue/youtube-chat-membership-queue.service'
import { YoutubeChatPollQueueService } from './queue/youtube-chat-poll-queue.service'
import { YoutubeChatSuperChatQueueService } from './queue/youtube-chat-super-chat-queue.service'

@Injectable()
export class YoutubeChatService {
  private readonly logger = new Logger(YoutubeChatService.name)

  private readonly httpLimiter = new Bottleneck({
    maxConcurrent: this.configService.get<number>('YOUTUBE_CHAT_HTTP_LIMITER_MAX_CONCURRENT'),
  })

  constructor(
    private readonly configService: ConfigService,
    private readonly youtubeChatQueueService: YoutubeChatActionQueueService,
    private readonly youtubeSuperChatQueueService: YoutubeChatSuperChatQueueService,
    private readonly youtubeChatMembershipQueueService: YoutubeChatMembershipQueueService,
    private readonly youtubeChatPollQueueService: YoutubeChatPollQueueService,
    private readonly youtubeChatBannerQueueService: YoutubeChatBannerQueueService,
  ) { }

  public async init(videoId: string, config?: YoutubeChatJobConfig) {
    const chat = new YoutubeMasterchat(videoId, config, this.httpLimiter)
    await chat.populateMetadata()
    this.addChatListeners(chat)
    return chat
  }

  private addChatListeners(chat: YoutubeMasterchat) {
    chat.on('actions', async (actions) => {
      const queueActions = actions.filter((v: any) => v.id)
      await Promise.allSettled((queueActions).map((action) => this.queueAction(chat, action)))
    })
  }

  private queueAction(chat: YoutubeMasterchat, action: Action) {
    const ignoreTypes = [
      'addPlaceholderItemAction',
      'addViewerEngagementMessageAction',
      'showTooltipAction',
      'showPanelAction',
      'closePanelAction',
      'membershipGiftRedemptionAction',
    ]
    if (ignoreTypes.includes(action.type)) {
      return null
    }

    const body = {
      ...YoutubeChatUtil.generateChatMetadata(chat),
      action,
    }

    const isSuperChat = false
      || YoutubeChatUtil.isAddSuperChatItemAction(action)
      || YoutubeChatUtil.isAddSuperChatTickerAction(action)
    if (isSuperChat) {
      return this.youtubeSuperChatQueueService.add(body)
    }

    const isMembership = false
      || YoutubeChatUtil.isAddMembershipItemAction(action)
      || YoutubeChatUtil.isAddMembershipTickerAction(action)
      || YoutubeChatUtil.isAddMembershipMilestoneItemAction(action)
      || YoutubeChatUtil.isMembershipGiftPurchaseAction(action)
      || YoutubeChatUtil.isMembershipGiftRedemptionAction(action)
    if (isMembership) {
      return this.youtubeChatMembershipQueueService.add(body)
    }

    const isPoll = false
      || YoutubeChatUtil.isShowPollPanelActionAction(action)
      || YoutubeChatUtil.isUpdatePollActionAction(action)
      || YoutubeChatUtil.isAddPollResultActionAction(action)
    if (isPoll) {
      return this.youtubeChatPollQueueService.add(body)
    }

    const isBanner = false
      || YoutubeChatUtil.isAddBannerAction(action)
    if (isBanner) {
      return this.youtubeChatBannerQueueService.add(body)
    }

    return this.youtubeChatQueueService.add(body)
  }
}
