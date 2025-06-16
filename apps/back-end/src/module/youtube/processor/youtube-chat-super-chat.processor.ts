import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'

@Processor(YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.YOUTUBE_CHAT_SUPER_CHAT_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeChatSuperChatProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeChatSuperChatProcessor.name)

  constructor(
    private readonly youtubeChatHandlerService: YoutubeChatHandlerService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    await this.youtubeChatHandlerService.handleAction(job.data)
    await job.updateProgress(100)
  }
}
