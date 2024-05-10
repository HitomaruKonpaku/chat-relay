import { YoutubeChatAction } from '@app/youtube'
import { NumberUtil } from '@shared/util/number.util'
import { AddMembershipMilestoneItemAction, stringify } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'

export class YoutubeAddMembershipMilestoneItemActionHandler extends BaseActionHandler<AddMembershipMilestoneItemAction, AddMembershipMilestoneItemAction> {
  getYoutubeChatAction(): YoutubeChatAction {
    return {
      ...this.action,
      id: this.action.id,
      createdAt: NumberUtil.fromDate(this.action.timestamp),
      modifiedAt: Date.now(),
      type: this.action.type,
      videoId: this.video.id,
      message: stringify(this.action.message),
    }
  }

  getProcessAction(): AddMembershipMilestoneItemAction {
    return this.action
  }

  getIcons(): string[] {
    return []
  }
}
