import { YOUTUBE_VIDEO_CHAT_ALT_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import ms from 'ms'
import { YoutubeChatJobConfig } from '../../interface/youtube-chat-job-config.interface'
import { YoutubeVideoChatJobData } from '../../interface/youtube-video-chat-job-data.interface'

@Injectable()
export class YoutubeVideoChatAltQueueService {
  constructor(
    @InjectQueue(YOUTUBE_VIDEO_CHAT_ALT_QUEUE_NAME)
    public readonly queue: Queue<YoutubeVideoChatJobData>,
  ) { }

  public async add(videoId: string, options?: JobsOptions, config?: YoutubeChatJobConfig) {
    const jobId = videoId
    const job = await this.queue.add(
      jobId,
      { videoId, config },
      {
        jobId,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: ms('2m'),
        },
        removeOnComplete: {
          age: ms('4h') * 1e-3,
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
