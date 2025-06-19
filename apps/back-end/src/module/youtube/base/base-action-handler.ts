import { DatabaseInsertQueueService } from '@/app/database-queue'
import { DiscordMessageRelayQueueService } from '@/app/discord'
import { Track, TrackService } from '@/app/track'
import { UserFilter, UserFilterRepository, UserFilterType, UserSourceType } from '@/app/user'
import { YoutubeChatAction, YoutubeChatActionJobData, YoutubeChatUtil } from '@/app/youtube'
import { Logger } from '@/shared/logger/logger'
import { ModuleRef } from '@nestjs/core'
import { bold, inlineCode } from 'discord.js'
import {
  AddBannerAction,
  AddChatItemAction,
  AddMembershipItemAction,
  AddMembershipMilestoneItemAction,
  AddMembershipTickerAction,
  AddSuperChatItemAction,
  AddSuperChatTickerAction,
  AddSuperStickerItemAction,
  MembershipGiftPurchaseAction,
  MembershipGiftRedemptionAction,
  stringify,
} from 'masterchat'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

export type HandlerAction = AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddSuperChatTickerAction
  | AddSuperStickerItemAction
  | AddMembershipItemAction
  | AddMembershipTickerAction
  | AddMembershipMilestoneItemAction
  | MembershipGiftPurchaseAction
  | MembershipGiftRedemptionAction

export type ProcessAction = AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddMembershipMilestoneItemAction

export abstract class BaseActionHandler<T1 extends HandlerAction, T2 extends ProcessAction> {
  protected readonly logger = new Logger(BaseActionHandler.name)

  private userFilter?: UserFilter

  constructor(
    protected readonly data: YoutubeChatActionJobData<T1>,
    protected readonly moduleRef: ModuleRef,
  ) { }

  protected get channel() {
    return this.data.channel
  }

  protected get video() {
    return this.data.video
  }

  protected get action() {
    return this.data.action
  }

  protected get hostId() {
    return this.channel.id
  }

  protected get authorId() {
    return this.action.authorChannelId
  }

  abstract getYoutubeChatAction(): YoutubeChatAction

  abstract getProcessAction(): T2

  abstract getIcons(track: Track): string[]

  public async save() {
    const data = this.getYoutubeChatAction()
    const service = this.moduleRef.get(DatabaseInsertQueueService, { strict: false })
    await service.add({ table: 'youtube_chat_action', data }, this.data.config?.jobsOptions)
  }

  public async handle() {
    if (!this.hasMessage()) {
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

  protected hasMessage(): boolean {
    // eslint-disable-next-line dot-notation
    const tmp = this.action['message']
    return !!tmp
  }

  protected async handleTrack(track: Track) {
    const action = this.getProcessAction()
    if (!YoutubeChatHandlerUtil.canRelay(this.data, action, track, this.userFilter)) {
      return
    }

    const icons = this.getIcons(track)
    const name = inlineCode(YoutubeChatUtil.getAuthorName(action))
    const displayHeader = [
      YoutubeChatHandlerUtil.getSrcHyperlink(this.data),
      icons.join(' '),
      name,
    ].filter((v) => v).join(' ')

    const message = stringify(action.message) || ''
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
      lines.push(`↪️ ${YoutubeChatHandlerUtil.getChannelHyperlink(this.data)}`)
    }

    const content = lines.filter((v) => v).map((v) => v.trim()).join('\n').trim()
    await this.queueMsgRelay(track, this.data, content)
  }

  protected async fetchUserFilter(sourceId: string): Promise<UserFilter> {
    const service = this.moduleRef.get(UserFilterRepository, { strict: false })
    const res = await service.findOne({
      sourceType: UserSourceType.YOUTUBE,
      sourceId,
    })
    return res
  }

  protected async fetchTracks(): Promise<Track[]> {
    const service = this.moduleRef.get(TrackService, { strict: false })

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

  protected async queueMsgRelay(
    track: Track,
    data: YoutubeChatActionJobData<T1>,
    content: string,
  ) {
    const service = this.moduleRef.get(DiscordMessageRelayQueueService, { strict: false })
    await service.add(
      {
        channelId: track.discordChannelId,
        content,
        metadata: {
          source: UserSourceType.YOUTUBE,
          channel: data.channel,
          video: data.video,
          action: {
            type: data.action.type,
            id: data.action.id,
          },
        },
      },
    )
  }
}
