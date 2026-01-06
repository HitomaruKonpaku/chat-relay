import { Track, TrackService } from '@/app/track'
import { UserFilter, UserFilterRepository, UserFilterType, UserSourceType } from '@/app/user'
import { ChatHandlerAction, ChatProcessAction, YoutubeChatAction, YoutubeChatUtil } from '@/app/youtube'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { bold, inlineCode } from 'discord.js'
import { stringify } from 'masterchat'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'
import { YoutubeChatRelayUtil } from '../util/youtube-chat-relay.util'
import { BaseActionHandler } from './base-action.handler'

export abstract class BaseChatActionHandler<T extends ChatHandlerAction, R extends ChatProcessAction> extends BaseActionHandler<T, R> {
  protected readonly logger = new Logger(BaseChatActionHandler.name)

  private userFilter?: UserFilter

  protected get authorId() {
    return this.action.authorChannelId
  }

  public getProcessAction(): R {
    return this.action as any
  }

  public getMainAction(): R {
    return this.getProcessAction()
  }

  /**
   * Transform `action` to `YoutubeChatAction`
   */
  public getYoutubeChatAction(): YoutubeChatAction {
    const action = this.getProcessAction()
    const id = action.id || this.action.id
    if (!id) {
      throw new Error('ID_NOT_FOUND')
    }

    const yca: YoutubeChatAction = {
      ...action,
      id,
      createdAt: NumberUtil.fromDate(action.timestamp),
      modifiedAt: Date.now(),
      type: action.type,
      videoId: this.video.id,
      message: this.getYoutubeChatActionMessage(),
    }

    return yca
  }

  public getYoutubeChatActionMessage(): string {
    const action = this.getProcessAction()
    const msg = stringify(action.message)
    return msg
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTrackMessageIcons(track: Track): string[] {
    return []
  }

  public async handle() {
    if (!this.canHandle()) {
      return
    }

    this.userFilter = await this.fetchUserFilter(this.authorId)
    if (this.userFilter?.type === UserFilterType.DENY) {
      return
    }

    const tracks = await this.fetchTracks()
    if (!tracks.length) {
      return
    }

    await Promise.all(tracks.map(async (track) => {
      try {
        await this.handleTrack(track)
      } catch (error) {
        this.logger.error(`handleTrack: ${error.message} | ${JSON.stringify({ action: this.action, track })}`)
      }
    }))
  }

  protected canHandle(): boolean {
    const hasMessage = !!(this.action as any).message
    return hasMessage
  }

  protected async handleTrack(track: Track) {
    const action = this.getProcessAction()
    if (!YoutubeChatRelayUtil.canRelay(this.data, action, track, this.userFilter)) {
      return
    }

    const content = this.getContent(action, track)
    const metadata = this.getMetadata()

    const service = this.getInstance(YoutubeChatHandlerService)
    await service.queueDiscordMsg({ channelId: track.discordChannelId, payload: content, metadata })
  }

  // #region UserFilter & Track

  protected async fetchUserFilter(sourceId: string): Promise<UserFilter> {
    const service = this.getInstance(UserFilterRepository)
    const res = await service.findOne({
      sourceType: UserSourceType.YOUTUBE,
      sourceId,
    })
    return res
  }

  protected async fetchTracks(): Promise<Track[]> {
    const service = this.getInstance(TrackService)

    if (this.authorId === this.hostId || YoutubeChatUtil.isAddBannerAction(this.action)) {
      const tracks = await service.findByHostId(
        UserSourceType.YOUTUBE,
        this.hostId,
      )
      return tracks
    }

    if (this.userFilter?.type === UserFilterType.ALLOW) {
      const tracks = await service.findByFilterAllow(
        UserSourceType.YOUTUBE,
        this.hostId,
        this.authorId,
      )
      return tracks
    }

    const tracks = await service.findByAuthorId(
      UserSourceType.YOUTUBE,
      this.authorId,
    )
    return tracks
  }

  // #endregion

  protected getContent(action: R, track: Track): string {
    const icons = this.getTrackMessageIcons(track)
    const name = inlineCode(YoutubeChatUtil.getAuthorName(action))
    const displayHeader = [
      YoutubeChatRelayUtil.getSrcHyperlink(this.data),
      icons.join(' '),
      name,
    ].filter((v) => v).join(' ')

    const message = YoutubeChatUtil.getMessage(action)
    const displayMessage = message
      ? `${bold(inlineCode(message))}`
      : ''

    let primaryLine = displayHeader
    if (displayMessage) {
      primaryLine += `: ${displayMessage}`
    }

    const lines = [
      primaryLine,
    ]

    if (!YoutubeChatUtil.isAddBannerAction(action) && !track.sourceId) {
      lines.push(`↪️ ${YoutubeChatRelayUtil.getChannelHyperlink(this.data)}`)
    }

    const res = lines.filter((v) => v).map((v) => v.trim()).join('\n').trim()
    return res
  }
}
