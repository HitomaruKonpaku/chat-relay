import { AddChatSummaryBannerAction, stringify } from 'masterchat'
import { BaseNotificationActionHandler } from '../base/base-notification-action.handler'

export class YoutubeAddChatSummaryBannerActionHandler extends BaseNotificationActionHandler<AddChatSummaryBannerAction> {
  public getYoutubeChatActionMessage(): string {
    return stringify(this.action.chatSummary)
  }

  protected canHandle(): boolean {
    return true
  }
}
