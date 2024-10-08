import { DatabaseModule } from '@/app/database'
import { DatabaseQueueModule } from '@/app/database-queue'
import { DiscordModule } from '@/app/discord'
import { QueueModule } from '@/app/queue'
import { YoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { ChatMqController } from './chat-mq.controller'
import { ChatMqService } from './chat-mq.service'
import { YoutubeChatModule } from './module/youtube/youtube-chat.module'

@Module({
  imports: [
    QueueModule,

    DatabaseModule,
    DatabaseQueueModule,

    DiscordModule,
    YoutubeModule,

    YoutubeChatModule,
  ],
  controllers: [
    ChatMqController,
  ],
  providers: [
    ChatMqService,
  ],
})
export class ChatMqModule { }
