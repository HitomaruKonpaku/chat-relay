import {
  YoutubeChatActionJobData,
  YoutubeChatUtil,
} from '@/app/youtube'
import { ModuleRef } from '@nestjs/core'
import { BaseActionHandler } from '../base/base-action.handler'
import { YoutubeAddBannerActionHandler } from '../handler/youtube-add-banner-action-handler'
import { YoutubeAddChatItemActionHandler } from '../handler/youtube-add-chat-item-action-handler'
import { YoutubeAddChatSummaryBannerActionHandler } from '../handler/youtube-add-chat-summary-banner-action-handler'
import { YoutubeAddMembershipItemActionHandler } from '../handler/youtube-add-membership-item-action-handler'
import { YoutubeAddMembershipMilestoneItemActionHandler } from '../handler/youtube-add-membership-milestone-item-action-handler'
import { YoutubeAddMembershipTickerActionHandler } from '../handler/youtube-add-membership-ticker-action-handler'
import { YoutubeAddSuperChatItemActionHandler } from '../handler/youtube-add-super-chat-item-action-handler'
import { YoutubeAddSuperChatTickerActionHandler } from '../handler/youtube-add-super-chat-ticker-action-handler'
import { YoutubeAddSuperStickerItemAction } from '../handler/youtube-add-super-sticker-item-action-handler'
import { YoutubeMembershipGiftPurchaseActionHandler } from '../handler/youtube-membership-gift-purchase-action-handler'
import { YoutubeMembershipGiftRedemptionActionHandler } from '../handler/youtube-membership-gift-redemption-action-handler'

export class YoutubeChatHandlerUtil {
  public static init(
    data: YoutubeChatActionJobData<any>,
    moduleRef: ModuleRef,
  ): BaseActionHandler<any> {
    if (YoutubeChatUtil.isAddBannerAction(data.action)) {
      return new YoutubeAddBannerActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddChatSummaryBannerAction(data.action)) {
      return new YoutubeAddChatSummaryBannerActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddChatItemAction(data.action)) {
      return new YoutubeAddChatItemActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddSuperChatItemAction(data.action)) {
      return new YoutubeAddSuperChatItemActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddSuperChatTickerAction(data.action)) {
      return new YoutubeAddSuperChatTickerActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddSuperStickerItemAction(data.action)) {
      return new YoutubeAddSuperStickerItemAction(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddMembershipItemAction(data.action)) {
      return new YoutubeAddMembershipItemActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddMembershipTickerAction(data.action)) {
      return new YoutubeAddMembershipTickerActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isAddMembershipMilestoneItemAction(data.action)) {
      return new YoutubeAddMembershipMilestoneItemActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isMembershipGiftPurchaseAction(data.action)) {
      return new YoutubeMembershipGiftPurchaseActionHandler(data, moduleRef)
    }
    if (YoutubeChatUtil.isMembershipGiftRedemptionAction(data.action)) {
      return new YoutubeMembershipGiftRedemptionActionHandler(data, moduleRef)
    }
    return null
  }
}
