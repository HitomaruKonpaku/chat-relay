import { DiscordMessageRelayQueueService } from '@app/discord'
import { Track, TrackRepository } from '@app/track'
import { UserFilter, UserFilterRepository, UserFilterType, UserSourceType } from '@app/user'
import { YoutubeChatAction, YoutubeChatActionJobData, YoutubeChatActionRepository, YoutubeChatUtil, YoutubeVideoUtil } from '@app/youtube'
import { ModuleRef } from '@nestjs/core'
import { bold, hideLinkEmbed, hyperlink, inlineCode, spoiler } from 'discord.js'
import {
  AddBannerAction,
  AddChatItemAction,
  AddMembershipItemAction,
  AddMembershipMilestoneItemAction,
  AddMembershipTickerAction,
  AddSuperChatItemAction,
  AddSuperChatTickerAction,
  MembershipGiftPurchaseAction,
  MembershipGiftRedemptionAction,
  stringify,
} from 'masterchat'

export type HandlerAction = AddBannerAction
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddSuperChatTickerAction
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
  private userFilter?: UserFilter

  constructor(
    protected readonly data: YoutubeChatActionJobData<T1>,
    private readonly moduleRef: ModuleRef,
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
    const service = this.moduleRef.get(YoutubeChatActionRepository, { strict: false })
    const data = service.repository.create(this.getYoutubeChatAction())
    await service.save(data)
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

    await Promise.allSettled(tracks.map((track) => this.handleTrack(track)))
  }

  protected hasMessage(): boolean {
    // eslint-disable-next-line dot-notation
    const tmp = this.action['message']
    return !!tmp
  }

  protected async handleTrack(track: Track) {
    if (!this.data.video.isLive && !track.allowReplay) {
      return
    }
    if (this.data.video.isMembersOnly && !track.allowMemberChat) {
      return
    }
    if (!this.data.video.isMembersOnly && !track.allowPublicChat) {
      return
    }

    if (this.authorId === this.hostId) {
      if (this.authorId === track.filterId) {
        return
      }
      if (this.authorId === track.sourceId && track.filterId) {
        return
      }
    }

    const action = this.getProcessAction()
    const message = stringify(action.message)

    if (this.userFilter?.type === UserFilterType.ALLOW) {
      // ignore
    } else if (this.authorId === track.filterId) {
      if (track.filterKeywords?.length) {
        if (!track.filterKeywords.some((v) => message.toLowerCase().includes(v.toLowerCase()))) {
          return
        }
      }
    } else if (this.hostId !== track.sourceId) {
      return
    }

    const icons = this.getIcons(track)
    const url = YoutubeVideoUtil.getUrl(this.data.video.id)
    const src = spoiler(hyperlink(
      'src',
      hideLinkEmbed(url),
      [
        this.data.channel.name || this.data.channel.id,
        this.data.video.title || this.data.video.id,
      ].join('\n'),
    ))
    const name = inlineCode(YoutubeChatUtil.getAuthorName(action))
    const content = [src, icons.join(' '), name].filter((v) => v).join(' ') + `: ${bold(inlineCode(message))}`.trim()
    await this.queueActionRelay(track, this.data, content.trim())
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
    const service = this.moduleRef.get(TrackRepository, { strict: false })

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

  protected async queueActionRelay(
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
