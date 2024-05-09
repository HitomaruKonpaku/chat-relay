import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME } from '../../youtube.constant'

@Injectable()
export class YoutubeVideoChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_VIDEO_CHAT_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async add(videoId: string, options?: JobsOptions) {
    const jobId = videoId
    const job = await this.queue.add(
      jobId,
      { videoId },
      {
        jobId,
        attempts: 10,
        backoff: {
          type: 'fixed',
          delay: 2 * 60 * 1000,
        },
        removeOnComplete: {
          age: 24 * 3600,
        },
        ...options,
      },
    )
    return job
  }
}
