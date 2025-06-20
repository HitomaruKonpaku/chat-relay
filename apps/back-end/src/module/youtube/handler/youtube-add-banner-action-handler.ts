import { Track } from '@/app/track'
import { AddBannerAction } from 'masterchat'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'
import { YoutubeChatRelayUtil } from '../util/youtube-chat-relay.util'

export class YoutubeAddBannerActionHandler extends BaseChatActionHandler<AddBannerAction, AddBannerAction> {
  public getProcessAction(): AddBannerAction {
    return this.action
  }

  public getTrackMessageIcons(track: Track): string[] {
    return YoutubeChatRelayUtil.getChatIcons(this.getProcessAction(), track)
  }
}
