import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'
import { YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME } from '../../youtube.constant'

@Injectable()
export class YoutubeChatMembershipQueueService extends BaseYoutubeChatQueueService {
  constructor(
    @InjectQueue(YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(queue)
  }
}
