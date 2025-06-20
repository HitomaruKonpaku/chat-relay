import { AddSuperChatItemAction, AddSuperChatTickerAction } from 'masterchat'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'
import { YoutubeChatRelayUtil } from '../util/youtube-chat-relay.util'

export class YoutubeAddSuperChatTickerActionHandler extends BaseChatActionHandler<AddSuperChatTickerAction, AddSuperChatItemAction> {
  public getProcessAction(): AddSuperChatItemAction {
    return this.action.contents
  }

  public getTrackMessageIcons(): string[] {
    return YoutubeChatRelayUtil.getSuperChatIcons(this.getProcessAction())
  }

  protected canHandle(): boolean {
    return true
  }
}
