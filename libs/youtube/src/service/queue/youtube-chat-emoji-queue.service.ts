import { YOUTUBE_CHAT_EMOJI_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import ms from 'ms'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'
import { YoutubeChatEmojiJobData } from '../../interface/youtube-chat-emoji-job-data.interface'

@Injectable()
export class YoutubeChatEmojiQueueService extends BaseYoutubeChatQueueService<YoutubeChatEmojiJobData> {
  constructor(
    protected readonly configService: ConfigService,
    @InjectQueue(YOUTUBE_CHAT_EMOJI_QUEUE_NAME)
    protected readonly queue: Queue<YoutubeChatEmojiJobData>,
  ) {
    super(configService, queue)
    this.removeOnComplete = ms('30d') * 1e-3
  }

  public async add(data: YoutubeChatEmojiJobData) {
    const jobId = data.emoji.emojiId
    const job = await this.queue.add(
      jobId,
      data,
      {
        jobId,
        attempts: 5,
        removeOnComplete: this.removeOnComplete,
        removeOnFail: this.removeOnFail,
      },
    )
    return job
  }
}
