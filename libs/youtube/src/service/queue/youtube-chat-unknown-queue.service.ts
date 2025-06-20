import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { YOUTUBE_CHAT_UNKNOWN_QUEUE_NAME } from '../../../../../constant/youtube.constant'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'

@Injectable()
export class YoutubeChatUnknownQueueService extends BaseYoutubeChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_CHAT_UNKNOWN_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(queue)
  }
}
