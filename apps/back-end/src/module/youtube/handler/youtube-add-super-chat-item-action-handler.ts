import { YoutubeChatAction } from '@app/youtube'
import { NumberUtil } from '@shared/util/number.util'
import { AddSuperChatItemAction, stringify } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

export class YoutubeAddSuperChatItemActionHandler extends BaseActionHandler<AddSuperChatItemAction, AddSuperChatItemAction> {
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

  getProcessAction(): AddSuperChatItemAction {
    return this.action
  }

  getIcons(): string[] {
    return YoutubeChatHandlerUtil.getSuperChatIcons(this.getProcessAction())
  }
}
