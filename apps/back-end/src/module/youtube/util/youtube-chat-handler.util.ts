import { Track } from '@app/track'
import { UserFilter } from '@app/user'
import {
  YoutubeChannelUtil,
  YoutubeChatActionJobData,
  YoutubeChatMetadata,
  YoutubeChatUtil,
  YoutubeVideoUtil,
} from '@app/youtube'
import { NumberUtil } from '@shared/util/number.util'
import { hideLinkEmbed, hyperlink, spoiler } from 'discord.js'
import {
  AddBannerAction,
  AddChatItemAction,
  AddSuperChatItemAction,
  stringify,
} from 'masterchat'
import { TrackHandlerUtil } from '../../../util/track-handler.util'
import { ProcessAction } from '../base/base-action-handler'

export class YoutubeChatHandlerUtil {
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
      const maxAge = (NumberUtil.parse(process.env.YOUTUBE_ACTION_MAX_AGE) || 3600) * 1000
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
