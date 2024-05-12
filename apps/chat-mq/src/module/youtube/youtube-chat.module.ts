import { DatabaseQueueModule } from '@app/database-queue'
import { UserModule } from '@app/user'
import { YoutubeModule } from '@app/youtube'
import { Module } from '@nestjs/common'
import { YoutubeVideoChatProcessor } from './processor/youtube-video-chat.processor'

@Module({
  imports: [
    DatabaseQueueModule,
    UserModule,
    YoutubeModule,
  ],
  providers: [
    YoutubeVideoChatProcessor,
  ],
})
export class YoutubeChatModule { }
