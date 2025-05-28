import { YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import ms from 'ms'
import { YoutubeVideoChatEndJobData } from '../../interface/youtube-video-chat-end-job-data.interface'

@Injectable()
export class YoutubeVideoChatEndQueueService {
  constructor(
    @InjectQueue(YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME)
    private readonly queue: Queue<YoutubeVideoChatEndJobData>,
  ) { }

  public async add(data: YoutubeVideoChatEndJobData, options?: JobsOptions) {
    const jobId = data.id
    const job = await this.queue.add(
      jobId,
      data,
      {
        jobId,
        attempts: 5,
        removeOnComplete: {
          age: ms('24h') * 1e-3,
        },
        removeOnFail: {
          age: ms('30d') * 1e-3,
        },
        ...options,
      },
    )
    return job
  }
}
