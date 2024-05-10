import { Track } from '@app/track'
import { YoutubeChatUtil } from '@app/youtube'
import { AddBannerAction, AddChatItemAction, AddSuperChatItemAction } from 'masterchat'

export class YoutubeChatHandlerUtil {
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
    if (!isPinned && !track.sourceId) {
      icons.unshift('↪️')
    }
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
