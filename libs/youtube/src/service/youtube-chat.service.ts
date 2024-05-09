import { Injectable } from '@nestjs/common'
import { Logger } from '@shared/logger/logger'
import { Action } from 'masterchat'
import { YoutubeChatUtil } from '../util/youtube-chat.util'
import { YoutubeMasterchat } from '../youtube-master-chat'
import { YoutubeChatActionQueueService } from './queue/youtube-chat-action-queue.service'
import { YoutubeChatSuperChatQueueService } from './queue/youtube-chat-super-chat-queue.service'

@Injectable()
export class YoutubeChatService {
  private readonly logger = new Logger(YoutubeChatService.name)

  constructor(
    private readonly youtubeChatQueueService: YoutubeChatActionQueueService,
    private readonly youtubeSuperChatQueueService: YoutubeChatSuperChatQueueService,
  ) { }

  public async init(videoId: string) {
    const chat = new YoutubeMasterchat(videoId)
    await chat.populateMetadata()
    this.addChatListeners(chat)
    return chat
  }

  private addChatListeners(chat: YoutubeMasterchat) {
    chat.on('actions', async (actions) => {
      const queueActions = actions.filter((v: any) => v.id)
      await Promise.allSettled((queueActions).map((action) => this.queueChatAction(chat, action)))
    })
  }

  private async queueChatAction(chat: YoutubeMasterchat, action: Action) {
    const body = { ...YoutubeChatUtil.generateChatMetadata(chat), action }
    const isSuperChat = false
      || YoutubeChatUtil.isAddSuperChatItemAction(action)
      || YoutubeChatUtil.isAddSuperChatTickerAction(action)

    if (isSuperChat) {
      await this.youtubeSuperChatQueueService.add(body)
      return
    }

    await this.youtubeChatQueueService.add(body)
  }
}
