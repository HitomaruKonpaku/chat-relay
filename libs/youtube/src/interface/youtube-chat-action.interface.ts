import {
  AddBannerAction,
  AddChatItemAction,
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

export type HandlerAction = AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddSuperChatTickerAction
  | AddSuperStickerItemAction
  | AddMembershipItemAction
  | AddMembershipTickerAction
  | AddMembershipMilestoneItemAction
  | MembershipGiftPurchaseAction
  | MembershipGiftRedemptionAction

export type ProcessAction = AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddMembershipMilestoneItemAction
  | (MembershipGiftRedemptionAction & YTMessage)
