import { Action, AddBannerAction, AddChatItemAction, AddSuperChatItemAction, AddSuperChatTickerAction, MembershipGiftPurchaseAction, SuperChatColor } from 'masterchat'
import { YoutubeChatMetadata } from '../interface/youtube-chat-metadata.interface'
import { YoutubeMasterchat } from '../youtube-master-chat'

export class YoutubeChatUtil {
  public static isAddBannerAction(action: Action): action is AddBannerAction {
    return action.type === 'addBannerAction'
  }

  public static isAddChatItemAction(action: Action): action is AddChatItemAction {
    return action.type === 'addChatItemAction'
  }

  public static isAddSuperChatItemAction(action: Action): action is AddSuperChatItemAction {
    return action.type === 'addSuperChatItemAction'
  }

  public static isAddSuperChatTickerAction(action: Action): action is AddSuperChatTickerAction {
    return action.type === 'addSuperChatTickerAction'
  }

  public static isMembershipGiftPurchaseAction(action: Action): action is MembershipGiftPurchaseAction {
    return action.type === 'membershipGiftPurchaseAction'
  }

  public static getAuthorName(action: AddChatItemAction): string {
    const s = action.authorName || action.authorChannelId
    return s
  }

  public static generateChatMetadata(chat: YoutubeMasterchat) {
    const metadata: YoutubeChatMetadata = {
      channel: {
        id: chat.channelId,
        name: chat.channelName,
      },
      video: {
        id: chat.videoId,
        title: chat.title,
        isLive: chat.isLive,
        isMembersOnly: chat.isMembersOnly,
      },
    }
    return metadata
  }

  public static toColorEmoji(color: SuperChatColor): string {
    const emojis: Record<SuperChatColor, string> = {
      blue: '🔵',
      lightblue: '🔵',
      green: '🟢',
      yellow: '🟡',
      orange: '🟠',
      magenta: '🟣',
      red: '🔴',
    }
    return emojis[color]
  }
}
