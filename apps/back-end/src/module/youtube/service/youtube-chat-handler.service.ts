import { YoutubeChatActionJobData, YoutubeChatUtil } from '@app/youtube'
import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { BaseActionHandler } from '../base/base-action-handler'
import { YoutubeAddBannerActionHandler } from '../handler/youtube-add-banner-action-handler'
import { YoutubeAddChatItemActionHandler } from '../handler/youtube-add-chat-item-action-handler'
import { YoutubeAddMembershipItemActionHandler } from '../handler/youtube-add-membership-item-action-handler'
import { YoutubeAddMembershipMilestoneItemActionHandler } from '../handler/youtube-add-membership-milestone-item-action-handler'
import { YoutubeAddSuperChatItemActionHandler } from '../handler/youtube-add-super-chat-item-action-handler'
import { YoutubeAddSuperChatTickerActionHandler } from '../handler/youtube-add-super-chat-ticker-action-handler'
import { YoutubeMembershipGiftPurchaseActionHandler } from '../handler/youtube-membership-gift-purchase-action-handler'

@Injectable()
export class YoutubeChatHandlerService {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) { }

  public async handleAction(data: YoutubeChatActionJobData<any>) {
    let handler: BaseActionHandler<any, any>

    if (YoutubeChatUtil.isAddBannerAction(data.action)) {
      handler = new YoutubeAddBannerActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isAddChatItemAction(data.action)) {
      handler = new YoutubeAddChatItemActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isAddSuperChatItemAction(data.action)) {
      handler = new YoutubeAddSuperChatItemActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isAddSuperChatTickerAction(data.action)) {
      handler = new YoutubeAddSuperChatTickerActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isAddMembershipItemAction(data.action)) {
      handler = new YoutubeAddMembershipItemActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isAddMembershipTickerAction(data.action)) {
      // handler = new YoutubeAddMembershipTickerActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isAddMembershipMilestoneItemAction(data.action)) {
      handler = new YoutubeAddMembershipMilestoneItemActionHandler(data, this.moduleRef)
    } else if (YoutubeChatUtil.isMembershipGiftPurchaseAction(data.action)) {
      handler = new YoutubeMembershipGiftPurchaseActionHandler(data, this.moduleRef)
    }

    if (handler) {
      await handler.save()
      await handler.handle()
      return
    }

    throw new Error(`unhandleAction: ${data.action.type}`)
  }
}
