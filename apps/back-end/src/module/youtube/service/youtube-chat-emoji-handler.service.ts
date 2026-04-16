import { DatabaseInsertQueueService } from '@/app/database-queue'
import { YoutubeChatEmoji, YoutubeChatEmojiJobData, YoutubeEmojiUtil } from '@/app/youtube'
import { Injectable, Type } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class YoutubeChatEmojiHandlerService {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) { }

  public async handle(jobData: YoutubeChatEmojiJobData) {
    const emoji = jobData?.emoji
    if (!emoji?.emojiId || !emoji?.isCustomEmoji) {
      return
    }

    const channelId = YoutubeEmojiUtil.parseChannelId(emoji.emojiId)
    if (!channelId) {
      return
    }

    const data: YoutubeChatEmoji = {
      ...emoji,
      id: emoji.emojiId,
      modifiedAt: Date.now(),
      channelId,
    }

    // eslint-disable-next-line dot-notation
    delete data['emojiId']

    const service = this.getInstance(DatabaseInsertQueueService)
    await service.add({ table: 'youtube_chat_emoji', data })
  }

  protected getInstance<TInput = any>(token: Type<TInput> | string): TInput {
    const res = this.moduleRef.get(token, { strict: false })
    return res
  }
}
