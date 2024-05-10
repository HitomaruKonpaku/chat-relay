import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'
import { YOUTUBE_CHAT_ACTION_QUEUE_NAME } from '../../youtube.constant'

@Injectable()
export class YoutubeChatActionQueueService extends BaseYoutubeChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_CHAT_ACTION_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(queue)
  }
}
