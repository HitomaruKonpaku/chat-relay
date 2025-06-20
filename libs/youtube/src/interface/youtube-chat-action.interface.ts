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
} from 'masterchat'

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
  | MembershipGiftRedemptionAction
