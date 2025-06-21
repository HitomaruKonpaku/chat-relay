import { DiscordMessageRelayJobData, DiscordMessageRelayQueueService } from '@/app/discord'
import { Track, TrackService } from '@/app/track'
import { UserSourceType } from '@/app/user'
import { YoutubeChatActionJobData, YoutubeChatMetadata } from '@/app/youtube'
import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'
import { BaseNotificationActionHandler } from '../base/base-notification-action.handler'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

@Injectable()
export class YoutubeChatHandlerService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly trackService: TrackService,
    private readonly discordMessageRelayQueueService: DiscordMessageRelayQueueService,
  ) { }

  public async handleAction(data: YoutubeChatActionJobData<any>) {
    const handler = YoutubeChatHandlerUtil.init(data, this.moduleRef)
    if (!handler) {
      throw new Error(`unhandleAction: ${data.action.type}`)
    }

    if (!data.config?.skipSave) {
      await handler.save()
    }

    if (!data.config?.skipHandle) {
      if (handler instanceof BaseNotificationActionHandler || handler instanceof BaseChatActionHandler) {
        await handler.handle()
      }
    }
  }

  public async handleNotification(
    metadata: YoutubeChatMetadata,
    data: Omit<DiscordMessageRelayJobData, 'channelId'>,
  ) {
    const tracks = await this.fetchHostTracks(metadata.channel.id)
    if (!tracks.length) {
      return []
    }

    await Promise.allSettled(tracks.map((track) => this.handleNotificationTrack(track, metadata, { ...data, channelId: track.discordChannelId })))
    return tracks
  }

  public async queueDiscordMsg(data: DiscordMessageRelayJobData) {
    await this.discordMessageRelayQueueService.add(data)
  }

  protected async fetchHostTracks(hostId: string): Promise<Track[]> {
    const tracks = await this.trackService.findByHostId(
      UserSourceType.YOUTUBE,
      hostId,
    )
    return tracks
  }

  private async handleNotificationTrack(
    track: Track,
    metadata: YoutubeChatMetadata,
    data: DiscordMessageRelayJobData,
  ) {
    if (!metadata.video.isLive && !track.allowReplay) {
      return
    }
    if (metadata.video.isMembersOnly && !track.allowMemberChat) {
      return
    }
    if (!metadata.video.isMembersOnly && !track.allowPublicChat) {
      return
    }

    await this.queueDiscordMsg(data)
  }
}
