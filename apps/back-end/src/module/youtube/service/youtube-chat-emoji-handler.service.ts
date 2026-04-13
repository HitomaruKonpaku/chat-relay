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
    const service = this.getInstance(DatabaseInsertQueueService)
    const data: YoutubeChatEmoji = {
      ...jobData.emoji,
      id: jobData.emoji.emojiId,
      modifiedAt: Date.now(),
      channelId: jobData.channel.id,
    }

    // eslint-disable-next-line dot-notation
    delete data['emojiId']
    delete data.channel

    await service.add({ table: 'youtube_chat_emoji', data })
  }

  protected getInstance<TInput = any>(token: Type<TInput> | string): TInput {
    const res = this.moduleRef.get(token, { strict: false })
    return res
  }
}
