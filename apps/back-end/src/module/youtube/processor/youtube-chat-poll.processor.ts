import { UserSourceType } from '@/app/user'
import {
  PollAction,
  YoutubeChatActionJobData,
  YoutubeChatUtil,
} from '@/app/youtube'
import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_CHAT_POLL_QUEUE_NAME } from '@/constant/youtube.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { YoutubePollActionContentBuilder } from '../helper/youtube-poll-action-content-builder'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'

@Processor(YOUTUBE_CHAT_POLL_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.YOUTUBE_CHAT_POLL_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeChatPollProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeChatPollProcessor.name)

  constructor(
    private readonly youtubeChatHandlerService: YoutubeChatHandlerService,
  ) {
    super()
  }

  async process(job: Job<YoutubeChatActionJobData<PollAction>>): Promise<any> {
    const res = await this.handle(job)
    await job.updateProgress(100)
    return res.map((v) => v.id)
  }

  protected async handle(job: Job<YoutubeChatActionJobData<PollAction>>) {
    const { data } = job
    const isPollAction = false
      || YoutubeChatUtil.isShowPollPanelActionAction(data.action)
      || YoutubeChatUtil.isUpdatePollActionAction(data.action)
      || YoutubeChatUtil.isAddPollResultActionAction(data.action)
    if (!isPollAction) {
      throw new Error(`unhandleAction: ${data.action.type}`)
    }

    const content = new YoutubePollActionContentBuilder(data).getContent()
    const metadata = this.getMetadata(data)

    const res = await this.youtubeChatHandlerService.handleNotification(data, { content, metadata })
    return res
  }

  private getMetadata(data: YoutubeChatActionJobData<PollAction>) {
    const res = {
      source: UserSourceType.YOUTUBE,
      channel: data.channel,
      video: data.video,
      action: {
        id: data.action.id,
        type: data.action.type,
      },
    }
    return res
  }
}
