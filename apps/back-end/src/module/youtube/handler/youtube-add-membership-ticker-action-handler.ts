import { YoutubeChatAction } from '@/app/youtube'
import { AddMembershipTickerAction } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'

export class YoutubeAddMembershipTickerActionHandler extends BaseActionHandler<AddMembershipTickerAction, any> {
  getYoutubeChatAction(): YoutubeChatAction {
    return {
      ...this.action,
      id: this.action.id,
      modifiedAt: Date.now(),
      type: this.action.type,
      videoId: this.video.id,
    }
  }

  getProcessAction(): AddMembershipTickerAction {
    return this.action
  }

  getIcons(): string[] {
    return []
  }
}
