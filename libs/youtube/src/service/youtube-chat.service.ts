import { Logger } from '@/shared/logger/logger'
import { Injectable } from '@nestjs/common'
import { Action } from 'masterchat'
import { YoutubeChatUtil } from '../util/youtube-chat.util'
import { YoutubeMasterchat } from '../youtube-master-chat'
import { YoutubeChatActionQueueService } from './queue/youtube-chat-action-queue.service'
import { YoutubeChatMembershipQueueService } from './queue/youtube-chat-membership-queue.service'
import { YoutubeChatPollQueueService } from './queue/youtube-chat-poll-queue.service'
import { YoutubeChatSuperChatQueueService } from './queue/youtube-chat-super-chat-queue.service'

@Injectable()
export class YoutubeChatService {
  private readonly logger = new Logger(YoutubeChatService.name)

  constructor(
    private readonly youtubeChatQueueService: YoutubeChatActionQueueService,
    private readonly youtubeSuperChatQueueService: YoutubeChatSuperChatQueueService,
    private readonly youtubeChatMembershipQueueService: YoutubeChatMembershipQueueService,
    private readonly youtubeChatPollQueueService: YoutubeChatPollQueueService,
  ) { }

  public async init(videoId: string) {
    const chat = new YoutubeMasterchat(videoId)
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

    const body = { ...YoutubeChatUtil.generateChatMetadata(chat), action }

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

    return this.youtubeChatQueueService.add(body)
  }
}
