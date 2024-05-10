import { YoutubeChatAction } from '@app/youtube'
import { NumberUtil } from '@shared/util/number.util'
import { MembershipGiftPurchaseAction } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'

export class YoutubeMembershipGiftPurchaseActionHandler extends BaseActionHandler<MembershipGiftPurchaseAction, any> {
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

  getProcessAction(): MembershipGiftPurchaseAction {
    return this.action
  }

  getIcons(): string[] {
    return []
  }
}
