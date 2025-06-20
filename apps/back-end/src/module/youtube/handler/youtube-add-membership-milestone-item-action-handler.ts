import { AddMembershipMilestoneItemAction } from 'masterchat'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'

export class YoutubeAddMembershipMilestoneItemActionHandler extends BaseChatActionHandler<AddMembershipMilestoneItemAction, AddMembershipMilestoneItemAction> {
  public getProcessAction(): AddMembershipMilestoneItemAction {
    return this.action
  }
}
