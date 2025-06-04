import { Track } from '@/app/track'
import { UserFilter } from '@/app/user'
import {
  YoutubeChannelUtil,
  YoutubeChatActionJobData,
  YoutubeChatMetadata,
  YoutubeChatUtil,
  YoutubeVideoUtil,
} from '@/app/youtube'
import { NumberUtil } from '@/shared/util/number.util'
import { ModuleRef } from '@nestjs/core'
import { hideLinkEmbed, hyperlink, spoiler } from 'discord.js'
import {
  AddBannerAction,
  AddChatItemAction,
  AddSuperChatItemAction,
  stringify,
} from 'masterchat'
import ms, { StringValue } from 'ms'
import { TrackHandlerUtil } from '../../../util/track-handler.util'
import { BaseActionHandler, ProcessAction } from '../base/base-action-handler'
import { YoutubeAddBannerActionHandler } from '../handler/youtube-add-banner-action-handler'
import { YoutubeAddChatItemActionHandler } from '../handler/youtube-add-chat-item-action-handler'
import { YoutubeAddMembershipItemActionHandler } from '../handler/youtube-add-membership-item-action-handler'
import { YoutubeAddMembershipMilestoneItemActionHandler } from '../handler/youtube-add-membership-milestone-item-action-handler'
import { YoutubeAddMembershipTickerActionHandler } from '../handler/youtube-add-membership-ticker-action-handler'
import { YoutubeAddSuperChatItemActionHandler } from '../handler/youtube-add-super-chat-item-action-handler'
import { YoutubeAddSuperChatTickerActionHandler } from '../handler/youtube-add-super-chat-ticker-action-handler'
import { YoutubeAddSuperStickerItemAction } from '../handler/youtube-add-super-sticker-item-action-handler'
import { YoutubeMembershipGiftPurchaseActionHandler } from '../handler/youtube-membership-gift-purchase-action-handler'

export class YoutubeChatHandlerUtil {
  public static initActionHandler(
    data: YoutubeChatActionJobData<any>,
    moduleRef: ModuleRef,
  ): BaseActionHandler<any, any> {
    if (YoutubeChatUtil.isAddBannerAction(data.action)) {
      return new YoutubeAddBannerActionHandler(data, moduleRef)
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
    return null
  }

  public static canRelay(
    data: YoutubeChatMetadata,
    action: ProcessAction,
    track: Track,
    userFilter?: Pick<UserFilter, 'type'>,
  ): boolean {
    if (!data.video.isLive && !track.allowReplay) {
      return false
    }

    if (data.video.isLive && action.timestamp) {
      const age = Date.now() - NumberUtil.fromDate(action.timestamp)
      const maxAge = ms(String(process.env.YOUTUBE_CHAT_ACTION_MAX_AGE || '1h') as StringValue)
      if (age > maxAge) {
        return false
      }
    }

    if (data.video.isMembersOnly && !track.allowMemberChat) {
      return false
    }

    if (!data.video.isMembersOnly && !track.allowPublicChat) {
      return false
    }

    const message = stringify(action.message) || ''
    if (!TrackHandlerUtil.canRelay(track, action.authorChannelId, data.channel.id, message, userFilter)) {
      return false
    }

    return true
  }

  public static getSrcHyperlink(data: YoutubeChatActionJobData) {
    const s = spoiler(
      hyperlink(
        'video',
        hideLinkEmbed(YoutubeVideoUtil.getUrl(data.video.id)),
        [
          data.channel.name || data.channel.id,
          data.video.title || data.video.id,
        ].join('\n'),
      ),
    )
    return s
  }

  public static getChannelHyperlink(data: YoutubeChatActionJobData) {
    const s = spoiler(
      hyperlink(
        data.channel.name || data.channel.id,
        hideLinkEmbed(YoutubeChannelUtil.getUrl(data.channel.id)),
      ),
    )
    return s
  }

  public static getChatIcons(
    action: AddBannerAction | AddChatItemAction,
    track: Track,
  ): string[] {
    const icons = []
    const isPinned = YoutubeChatUtil.isAddBannerAction(action)
    if (isPinned) {
      icons.push('📌')
    }
    if (action.isOwner) {
      icons.push('▶️')
    }
    if (action.isModerator) {
      icons.push('🔧')
    }
    if (track.filterId) {
      icons.push('💬')
    }
    // if (!isPinned && !track.sourceId) {
    //   icons.unshift('↪️')
    // }
    return icons
  }

  public static getSuperChatIcons(
    action: AddSuperChatItemAction,
  ): string[] {
    const icons = [
      '💴',
      YoutubeChatUtil.toColorEmoji(action.color),
    ]
    return icons
  }
}
