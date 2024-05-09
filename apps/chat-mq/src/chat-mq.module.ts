import { DatabaseModule } from '@app/database'
import { QueueModule } from '@app/queue'
import { Module } from '@nestjs/common'
import { ChatMqController } from './chat-mq.controller'
import { ChatMqService } from './chat-mq.service'
import { YoutubeChatModule } from './module/youtube/youtube-chat.module'

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
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
