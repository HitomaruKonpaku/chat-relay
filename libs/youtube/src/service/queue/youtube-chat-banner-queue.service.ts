import { YOUTUBE_CHAT_BANNER_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import ms from 'ms'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'

@Injectable()
export class YoutubeChatBannerQueueService extends BaseYoutubeChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_CHAT_BANNER_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(queue)
    this.removeOnComplete = ms('30d') * 1e-3
  }
}
