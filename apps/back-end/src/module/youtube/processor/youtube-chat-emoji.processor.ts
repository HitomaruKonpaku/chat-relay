import { YOUTUBE_CHAT_EMOJI_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { YoutubeChatEmojiHandlerService } from '../service/youtube-chat-emoji-handler.service'

@Processor(YOUTUBE_CHAT_EMOJI_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.YOUTUBE_CHAT_EMOJI_QUEUE_CONCURRENCY, 1),
})
export class YoutubeChatEmojiProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeChatEmojiProcessor.name)

  constructor(
    private readonly youtubeChatEmojiHandlerService: YoutubeChatEmojiHandlerService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    await this.youtubeChatEmojiHandlerService.handle(job.data)
    await job.updateProgress(100)
  }
}
