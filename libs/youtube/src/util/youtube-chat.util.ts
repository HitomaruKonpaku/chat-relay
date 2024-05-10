import {
  Action,
  AddBannerAction,
  AddChatItemAction,
  AddMembershipItemAction,
  AddMembershipMilestoneItemAction,
  AddMembershipTickerAction,
  AddPollResultAction,
  AddSuperChatItemAction,
  AddSuperChatTickerAction,
  Masterchat,
  MembershipGiftPurchaseAction,
  MembershipGiftRedemptionAction,
  ShowPollPanelAction,
  SuperChatColor,
  UpdatePollAction,
} from 'masterchat'
import { YoutubeChatMetadata } from '../interface/youtube-chat-metadata.interface'

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

  public static isAddMembershipItemAction(action: Action): action is AddMembershipItemAction {
    return action.type === 'addMembershipItemAction'
  }

  public static isAddMembershipTickerAction(action: Action): action is AddMembershipTickerAction {
    return action.type === 'addMembershipTickerAction'
  }

  public static isAddMembershipMilestoneItemAction(action: Action): action is AddMembershipMilestoneItemAction {
    return action.type === 'addMembershipMilestoneItemAction'
  }

  public static isMembershipGiftPurchaseAction(action: Action): action is MembershipGiftPurchaseAction {
    return action.type === 'membershipGiftPurchaseAction'
  }

  public static isMembershipGiftRedemptionAction(action: Action): action is MembershipGiftRedemptionAction {
    return action.type === 'membershipGiftRedemptionAction'
  }

  public static isShowPollPanelActionAction(action: Action): action is ShowPollPanelAction {
    return action.type === 'showPollPanelAction'
  }

  public static isUpdatePollActionAction(action: Action): action is UpdatePollAction {
    return action.type === 'updatePollAction'
  }

  public static isAddPollResultActionAction(action: Action): action is AddPollResultAction {
    return action.type === 'addPollResultAction'
  }

  public static getAuthorName(action: AddBannerAction | AddChatItemAction | AddSuperChatItemAction | AddMembershipMilestoneItemAction): string {
    const name = action.authorName || action.authorChannelId
    return name
  }

  public static generateChatMetadata(chat: Masterchat) {
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
