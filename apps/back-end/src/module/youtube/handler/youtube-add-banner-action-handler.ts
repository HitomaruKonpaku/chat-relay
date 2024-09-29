import { Track } from '@/app/track'
import { YoutubeChatAction } from '@/app/youtube'
import { NumberUtil } from '@/shared/util/number.util'
import { AddBannerAction, stringify } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

export class YoutubeAddBannerActionHandler extends BaseActionHandler<AddBannerAction, AddBannerAction> {
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

  getProcessAction(): AddBannerAction {
    return this.action
  }

  getIcons(track: Track): string[] {
    return YoutubeChatHandlerUtil.getChatIcons(this.getProcessAction(), track)
  }
}
