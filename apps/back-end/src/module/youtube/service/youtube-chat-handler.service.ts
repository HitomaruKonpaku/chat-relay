import { DiscordMessageRelayQueueService } from '@app/discord'
import { Track, TrackRepository } from '@app/track'
import { UserSourceType } from '@app/user'
import { YoutubeChatActionJobData, YoutubeChatUtil, YoutubeVideoUtil } from '@app/youtube'
import { Injectable } from '@nestjs/common'
import { bold, hideLinkEmbed, hyperlink, inlineCode, spoiler } from 'discord.js'
import { AddBannerAction, AddChatItemAction, AddSuperChatItemAction, AddSuperChatTickerAction, stringify } from 'masterchat'

type AddAction = AddBannerAction | AddChatItemAction | AddSuperChatItemAction | AddSuperChatTickerAction

@Injectable()
export class YoutubeChatHandlerService {
  constructor(
    private readonly trackRepository: TrackRepository,
    private readonly discordMessageRelayQueueService: DiscordMessageRelayQueueService,
  ) { }

  public async handleAction(data: YoutubeChatActionJobData) {
    const ignoreTypes = [
      'addViewerEngagementMessageAction',
    ]

    if (ignoreTypes.includes(data.action.type)) {
      return
    }

    if (YoutubeChatUtil.isAddBannerAction(data.action)) {
      await this.handleAddBannerAction(data as any)
      return
    }

    if (YoutubeChatUtil.isAddChatItemAction(data.action)) {
      await this.handleAddChatItemAction(data as any)
      return
    }

    if (YoutubeChatUtil.isAddSuperChatItemAction(data.action)) {
      await this.handleAddSuperChatItemAction(data as any)
      return
    }

    if (YoutubeChatUtil.isAddSuperChatTickerAction(data.action)) {
      await this.handleAddSuperChatTickerAction(data as any)
      return
    }

    // addMembershipItemAction

    // membershipGiftPurchaseAction

    throw new Error(`unhandleAction: ${data.action.type}`)
  }

  public async handleAddBannerAction(data: YoutubeChatActionJobData<AddBannerAction>) {
    const authorId = data.action.authorChannelId
    let tracks = await this.getTracks(authorId)
    tracks = tracks.filter((v) => v.sourceId === authorId && !v.filterId)
    if (tracks.length) {
      await Promise.allSettled(tracks.map((v) => this.processTrackChat(v, data)))
    }
  }

  public async handleAddChatItemAction(data: YoutubeChatActionJobData<AddChatItemAction>) {
    const authorId = data.action.authorChannelId
    const tracks = await this.getTracks(authorId)
    if (tracks.length) {
      await Promise.allSettled(tracks.map((v) => this.processTrackChat(v, data)))
    }
  }

  public async handleAddSuperChatItemAction(data: YoutubeChatActionJobData<AddSuperChatItemAction>) {
    const authorId = data.action.authorChannelId
    const tracks = await this.getTracks(authorId)
    if (tracks.length) {
      await Promise.allSettled(tracks.map((v) => this.processTrackSuperChat(v, data, data.action)))
    }
  }

  public async handleAddSuperChatTickerAction(data: YoutubeChatActionJobData<AddSuperChatTickerAction>) {
    const authorId = data.action.authorChannelId
    const tracks = await this.getTracks(authorId)
    if (tracks.length) {
      await Promise.allSettled(tracks.map((v) => this.processTrackSuperChat(v, data, data.action.contents)))
    }
  }

  private async getTracks(authorId: string) {
    const tracks = await this.trackRepository.findByAuthorId(UserSourceType.YOUTUBE, authorId)
    return tracks
  }

  private async processTrackChat(
    track: Track,
    data: YoutubeChatActionJobData<AddBannerAction | AddChatItemAction>,
  ) {
    if (!data.video.isLive && !track.allowReplay) {
      return
    }

    if (data.video.isMembersOnly && !track.allowMemberChat) {
      return
    }

    if (!data.video.isMembersOnly && !track.allowPublicChat) {
      return
    }

    const { action } = data
    const authorId = action.authorChannelId
    const message = stringify(action.message)
    if (authorId === track.filterId) {
      if (track.filterKeywords?.length) {
        if (!track.filterKeywords.some((v) => message.toLowerCase().includes(v.toLowerCase()))) {
          return
        }
      }
    } else if (data.channel.id !== track.sourceId) {
      return
    }

    const icons = []
    const isPinned = YoutubeChatUtil.isAddBannerAction(action)
    if (isPinned) {
      icons.push('📌')
    }
    if (action.isOwner) {
      icons.push('▶️')
    }
    if (action.isModerator) {
      icons.push('🔧')
    }
    if (track.filterId) {
      icons.push('💬')
    }
    if (!isPinned && !track.sourceId) {
      icons.unshift('↪️')
    }

    const url = YoutubeVideoUtil.getUrl(data.video.id)
    const src = spoiler(hyperlink('src', hideLinkEmbed(url)))
    const name = inlineCode(action.authorName || action.authorChannelId)
    const content = [src, icons.join(' '), name].filter((v) => v).join(' ') + `: ${bold(inlineCode(message))}`.trim()

    await this.queueActionRelay(track, data, action, content)
  }

  private async processTrackSuperChat(
    track: Track,
    data: YoutubeChatActionJobData<AddSuperChatItemAction | AddSuperChatTickerAction>,
    action: AddSuperChatItemAction,
  ) {
    if (!data.video.isLive && !track.allowReplay) {
      return
    }

    if (data.video.isMembersOnly && !track.allowMemberChat) {
      return
    }

    if (!data.video.isMembersOnly && !track.allowPublicChat) {
      return
    }

    const authorId = action.authorChannelId
    const message = stringify(action.message)
    if (authorId === track.filterId) {
      if (track.filterKeywords?.length) {
        if (!track.filterKeywords.some((v) => message.toLowerCase().includes(v.toLowerCase()))) {
          return
        }
      }
    } else if (data.channel.id !== track.sourceId) {
      return
    }

    const icons = [
      '💴',
      YoutubeChatUtil.toColorEmoji(action.color),
    ]

    const url = YoutubeVideoUtil.getUrl(data.video.id)
    const src = spoiler(hyperlink('src', hideLinkEmbed(url)))
    const name = inlineCode(action.authorName || action.authorChannelId)
    const content = [src, icons.join(' '), name].filter((v) => v).join(' ') + `: ${bold(inlineCode(message))}`.trim()

    await this.queueActionRelay(track, data, action, content)
  }

  private async queueActionRelay(
    track: Track,
    data: YoutubeChatActionJobData<AddAction>,
    action: AddAction,
    content: string,
  ) {
    await this.discordMessageRelayQueueService.add(
      {
        channelId: track.discordChannelId,
        content: content.trim(),
        metadata: {
          source: UserSourceType.YOUTUBE,
          channel: data.channel,
          video: data.video,
          action: {
            type: action.type,
            id: action.id,
          },
        },
      },
      {
        jobId: [data.video.id, action.id].join('.'),
      },
    )
  }
}
