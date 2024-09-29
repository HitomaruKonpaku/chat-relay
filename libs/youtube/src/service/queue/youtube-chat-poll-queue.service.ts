import { YOUTUBE_CHAT_POLL_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'

@Injectable()
export class YoutubeChatPollQueueService extends BaseYoutubeChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_CHAT_POLL_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(queue)
    this.removeOnComplete = false
  }
}
