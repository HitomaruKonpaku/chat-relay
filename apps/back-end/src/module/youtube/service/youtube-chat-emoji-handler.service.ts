import { DatabaseInsertQueueService } from '@/app/database-queue'
import { YoutubeChatEmoji, YoutubeChatEmojiJobData } from '@/app/youtube'
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

    const channelId = /^UC[\w-]{22}(?=\/)/.exec(emoji.emojiId)?.[0]
    if (!channelId) {
      return
    }

    const service = this.getInstance(DatabaseInsertQueueService)
    const data: YoutubeChatEmoji = {
      ...emoji,
      id: emoji.emojiId,
      modifiedAt: Date.now(),
      channelId,
    }

    // eslint-disable-next-line dot-notation
    delete data['emojiId']

    await service.add({ table: 'youtube_chat_emoji', data })
  }

  protected getInstance<TInput = any>(token: Type<TInput> | string): TInput {
    const res = this.moduleRef.get(token, { strict: false })
    return res
  }
}
