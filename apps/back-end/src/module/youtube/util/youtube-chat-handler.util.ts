import { Track } from '@app/track'
import {
  YoutubeChannelUtil,
  YoutubeChatActionJobData,
  YoutubeChatUtil,
  YoutubeVideoUtil,
} from '@app/youtube'
import { hideLinkEmbed, hyperlink, spoiler } from 'discord.js'
import {
  AddBannerAction,
  AddChatItemAction,
  AddSuperChatItemAction,
} from 'masterchat'

export class YoutubeChatHandlerUtil {
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
