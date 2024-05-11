import { JobsOptions, Queue } from 'bullmq'
import { YoutubeChatActionJobData } from '../interface/youtube-chat-action-job-data.interface'

export abstract class BaseYoutubeChatQueueService {
  constructor(
    protected readonly queue: Queue,
  ) { }

  public async add(data: YoutubeChatActionJobData, options?: JobsOptions) {
    const actionId = (data.action as any).id as string
    const jobId = [data.video.id, actionId].join('.')
    const job = await this.queue.add(
      jobId,
      data,
      {
        jobId,
        attempts: 5,
        removeOnComplete: {
          age: 8 * 3600,
        },
        ...options,
      },
    )
    return job
  }
}
