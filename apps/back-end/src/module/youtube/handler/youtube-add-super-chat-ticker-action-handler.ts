import { YoutubeChatAction } from '@/app/youtube'
import { NumberUtil } from '@/shared/util/number.util'
import { AddSuperChatItemAction, AddSuperChatTickerAction, stringify } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

export class YoutubeAddSuperChatTickerActionHandler extends BaseActionHandler<AddSuperChatTickerAction, AddSuperChatItemAction> {
  getYoutubeChatAction(): YoutubeChatAction {
    return {
      ...this.action,
      id: this.action.id,
      createdAt: NumberUtil.fromDate(this.action.contents.timestamp),
      modifiedAt: Date.now(),
      type: this.action.type,
      videoId: this.video.id,
      message: stringify(this.action.contents.message),
    }
  }

  getProcessAction(): AddSuperChatItemAction {
    return this.action.contents
  }

  getIcons(): string[] {
    return YoutubeChatHandlerUtil.getSuperChatIcons(this.getProcessAction())
  }

  protected hasMessage(): boolean {
    return true
  }
}
