import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import ms from 'ms'
import { YoutubeChatJobConfig } from '../../interface/youtube-chat-job-config.interface'
import { YoutubeVideoChatJobData } from '../../interface/youtube-video-chat-job-data.interface'

@Injectable()
export class YoutubeVideoChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_VIDEO_CHAT_QUEUE_NAME)
    public readonly queue: Queue<YoutubeVideoChatJobData>,
  ) { }

  public async add(videoId: string, options?: JobsOptions, config?: YoutubeChatJobConfig) {
    const jobId = videoId
    const job = await this.queue.add(
      jobId,
      { videoId, config },
      {
        jobId,
        attempts: 5,
        backoff: {
          type: 'fixed',
          delay: ms('2m'),
        },
        removeOnComplete: {
          age: ms('8h') * 1e-3,
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
