import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME, YoutubeChatService, YoutubeChatUtil } from '@app/youtube'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { Logger } from '@shared/logger/logger'
import { Job } from 'bullmq'
import { MasterchatError } from 'masterchat'

@Processor(YOUTUBE_VIDEO_CHAT_QUEUE_NAME, {
  maxStalledCount: 100,
  concurrency: 100,
})
export class YoutubeVideoChatProcessor extends BaseProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatProcessor.name)

  constructor(
    private readonly youtubeChatService: YoutubeChatService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    const jobData = job.data
    const chat = await this.youtubeChatService.init(jobData.videoId)
    Object.assign(jobData, YoutubeChatUtil.generateChatMetadata(chat))
    await job.updateData(jobData)

    let endError: MasterchatError
    let endReason: string

    chat.on('error', (error: MasterchatError) => {
      this.log(job, `[ERROR] ${error.code} - ${error.message}`)
      endError = error
    })

    chat.on('end', (reason) => {
      this.log(job, `[END] ${reason}`)
      endReason = reason
    })

    chat.on('actions', (actions) => {
      this.log(job, `[ACTIONS] ${actions.length}`)
    })

    this.log(job, '[LISTEN]')
    await chat.listen()

    if (endError) {
      throw endError
    }

    const res = JSON.parse(JSON.stringify({ endReason }))
    return res
  }
}
