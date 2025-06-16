import { JobsOptions, KeepJobs, Queue } from 'bullmq'
import ms from 'ms'
import { YoutubeChatActionJobData } from '../interface/youtube-chat-action-job-data.interface'

export abstract class BaseYoutubeChatQueueService {
  protected removeOnComplete?: boolean | number | KeepJobs = {
    age: ms('4h') * 1e-3,
  }

  protected removeOnFail?: boolean | number | KeepJobs = {
    age: ms('30d') * 1e-3,
  }

  constructor(
    protected readonly queue: Queue<YoutubeChatActionJobData>,
  ) { }

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
