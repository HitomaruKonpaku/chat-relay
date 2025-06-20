import {
  Action,
  AddBannerAction,
  AddChatItemAction,
  AddChatSummaryBannerAction,
  AddMembershipItemAction,
  AddMembershipMilestoneItemAction,
  AddMembershipTickerAction,
  AddSuperChatItemAction,
  AddSuperChatTickerAction,
  AddSuperStickerItemAction,
  MembershipGiftPurchaseAction,
  MembershipGiftRedemptionAction,
  YTRun,
} from 'masterchat'

export type YTMessage = { message?: YTRun[] | null }

export type BaseAction = Action & {
  id: string
  timestamp?: Date
}

export type NotificationAction =
  | AddChatSummaryBannerAction
  | AddSuperStickerItemAction
  | AddMembershipItemAction
  | MembershipGiftPurchaseAction
  | MembershipGiftRedemptionAction

export type ChatHandlerAction =
  | AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddSuperChatTickerAction
  | AddMembershipTickerAction
  | AddMembershipMilestoneItemAction

export type ChatProcessAction =
  | AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddMembershipMilestoneItemAction
