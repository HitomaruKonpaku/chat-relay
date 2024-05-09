import { YOUTUBE_CHAT_ACTION_QUEUE_NAME } from '@app/youtube'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { Logger } from '@shared/logger/logger'
import { Job } from 'bullmq'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'

@Processor(YOUTUBE_CHAT_ACTION_QUEUE_NAME, {
  maxStalledCount: 100,
  concurrency: 10,
})
export class YoutubeChatActionProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeChatActionProcessor.name)

  constructor(
    private readonly youtubeChatHandlerService: YoutubeChatHandlerService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    await this.youtubeChatHandlerService.handleAction(job.data)
  }
}
