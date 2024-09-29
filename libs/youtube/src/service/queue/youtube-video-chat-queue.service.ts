import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { YoutubeVideoChatJobData } from '../../interface/youtube-video-chat-job-data.interface'

@Injectable()
export class YoutubeVideoChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_VIDEO_CHAT_QUEUE_NAME)
    private readonly queue: Queue<YoutubeVideoChatJobData>,
  ) { }

  public async add(videoId: string, options?: JobsOptions) {
    const jobId = videoId
    const job = await this.queue.add(
      jobId,
      { videoId },
      {
        jobId,
        attempts: 5,
        backoff: {
          type: 'fixed',
          delay: 2 * 60 * 1000,
        },
        removeOnComplete: {
          age: 8 * 3600,
        },
        ...options,
      },
    )
    return job
  }
}
