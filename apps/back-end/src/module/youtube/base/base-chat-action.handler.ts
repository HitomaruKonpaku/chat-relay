import { DiscordMessageRelayQueueService } from '@/app/discord'
import { Track, TrackService } from '@/app/track'
import { UserFilter, UserFilterRepository, UserFilterType, UserSourceType } from '@/app/user'
import { ChatHandlerAction, ChatProcessAction, YoutubeChatActionJobData, YoutubeChatUtil } from '@/app/youtube'
import { Logger } from '@/shared/logger/logger'
import { bold, inlineCode } from 'discord.js'
import { stringify } from 'masterchat'
import { YoutubeChatRelayUtil } from '../util/youtube-chat-relay.util'
import { BaseActionHandler } from './base-action.handler'

export abstract class BaseChatActionHandler<THAction extends ChatHandlerAction, TPAction extends ChatProcessAction> extends BaseActionHandler<THAction> {
  protected readonly logger = new Logger(BaseChatActionHandler.name)

  private userFilter?: UserFilter

  protected get authorId() {
    return this.action.authorChannelId
  }

  public abstract getProcessAction(): TPAction

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

    const content = lines.filter((v) => v).map((v) => v.trim()).join('\n').trim()
    await this.queueMsgRelay(track, this.data, content)
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

    if (this.authorId === this.hostId) {
      const tracks = await service.findByHostId(
        UserSourceType.YOUTUBE,
        this.authorId,
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

  // #region Queue

  protected async queueMsgRelay(
    track: Track,
    data: YoutubeChatActionJobData<THAction>,
    content: string,
  ) {
    const service = this.getInstance(DiscordMessageRelayQueueService)
    await service.add(
      {
        channelId: track.discordChannelId,
        content,
        metadata: {
          source: UserSourceType.YOUTUBE,
          channel: data.channel,
          video: data.video,
          action: {
            id: data.action.id,
            type: data.action.type,
          },
        },
      },
    )
  }

  // #endregion
}
