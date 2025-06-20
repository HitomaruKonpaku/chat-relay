import { YoutubeChatAction } from '@/app/youtube'
import { NumberUtil } from '@/shared/util/number.util'
import { MembershipGiftRedemptionAction } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'

export class YoutubeMembershipGiftRedemptionActionHandler extends BaseActionHandler<MembershipGiftRedemptionAction, MembershipGiftRedemptionAction> {
  getYoutubeChatAction(): YoutubeChatAction {
    return {
      ...this.action,
      id: this.action.id,
      createdAt: NumberUtil.fromDate(this.action.timestamp),
      modifiedAt: Date.now(),
      type: this.action.type,
      videoId: this.video.id,
    }
  }

  getProcessAction(): MembershipGiftRedemptionAction {
    return this.action
  }

  getIcons(): string[] {
    return []
  }

  protected canHandle(): boolean {
    return false
  }
}
