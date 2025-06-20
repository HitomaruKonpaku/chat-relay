import { AddSuperChatItemAction } from 'masterchat'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'
import { YoutubeChatRelayUtil } from '../util/youtube-chat-relay.util'

export class YoutubeAddSuperChatItemActionHandler extends BaseChatActionHandler<AddSuperChatItemAction, AddSuperChatItemAction> {
  public getProcessAction(): AddSuperChatItemAction {
    return this.action
  }

  public getTrackMessageIcons(): string[] {
    return YoutubeChatRelayUtil.getSuperChatIcons(this.getProcessAction())
  }

  protected canHandle(): boolean {
    return true
  }
}
