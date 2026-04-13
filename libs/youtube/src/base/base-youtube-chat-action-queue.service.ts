import { JobsOptions } from 'bullmq'
import { YoutubeChatActionJobData } from '../interface/youtube-chat-action-job-data.interface'
import { BaseYoutubeChatQueueService } from './base-youtube-chat-queue.service'

export abstract class BaseYoutubeChatActionQueueService extends BaseYoutubeChatQueueService<YoutubeChatActionJobData> {
  public async add(data: YoutubeChatActionJobData, options?: JobsOptions) {
    const actionId = (data.action as any).id as string
    const jobId = [
      // data.video.id,
      actionId,
    ].join('.')
    const job = await this.queue.add(
      jobId,
      data,
      {
        jobId,
        attempts: 5,
        removeOnComplete: this.removeOnComplete,
        removeOnFail: this.removeOnFail,
        ...options,
      },
    )
    return job
  }
}
