import { YOUTUBE_CHAT_ERROR_QUEUE_NAME } from '@/constant/youtube.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { BaseYoutubeChatActionQueueService } from '../../base/base-youtube-chat-action-queue.service'

@Injectable()
export class YoutubeChatErrorQueueService extends BaseYoutubeChatActionQueueService {
  constructor(
    protected readonly configService: ConfigService,
    @InjectQueue(YOUTUBE_CHAT_ERROR_QUEUE_NAME)
    protected readonly queue: Queue,
  ) {
    super(configService, queue)
  }
}
