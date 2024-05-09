import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { YoutubeChatActionJobData } from '../../interface/youtube-chat-action-job-data.interface'
import { YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME } from '../../youtube.constant'

@Injectable()
export class YoutubeChatSuperChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async add(data: YoutubeChatActionJobData, options?: JobsOptions) {
    const actionId = (data.action as any).id as string
    const jobId = [data.video.id, actionId].join('.')
    const job = await this.queue.add(
      jobId,
      data,
      {
        jobId,
        attempts: 3,
        removeOnComplete: {
          age: 24 * 3600,
        },
        ...options,
      },
    )
    return job
  }
}
