import { AddMembershipTickerAction } from 'masterchat'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'

export class YoutubeAddMembershipTickerActionHandler extends BaseChatActionHandler<AddMembershipTickerAction, any> {
  public getProcessAction() {
    return this.action.contents
  }
}
