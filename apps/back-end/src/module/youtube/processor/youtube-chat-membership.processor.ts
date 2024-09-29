import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'

@Processor(YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME, {
  // autorun: false,
  concurrency: NumberUtil.parse(process.env.YOUTUBE_CHAT_MEMBERSHIP_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeChatMembershipProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeChatMembershipProcessor.name)

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
