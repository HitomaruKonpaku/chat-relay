import { YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { BaseYoutubeChatQueueService } from '../../base/base-youtube-chat-queue.service'

@Injectable()
export class YoutubeChatSuperChatQueueService extends BaseYoutubeChatQueueService {
  constructor(
    protected readonly configService: ConfigService,
    @InjectQueue(YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(configService, queue)
  }
}
