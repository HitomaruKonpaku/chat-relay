import { DatabaseQueueModule } from '@/app/database-queue'
import { MasterchatModule } from '@/app/masterchat'
import { UserModule } from '@/app/user'
import { YoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { YoutubeVideoChatAltProcessor } from './processor/youtube-video-chat-alt.processor'
import { YoutubeVideoChatProcessor } from './processor/youtube-video-chat.processor'

@Module({
  imports: [
    DatabaseQueueModule,
    UserModule,
    YoutubeModule,
    MasterchatModule,
  ],
  providers: [
    YoutubeVideoChatProcessor,
    YoutubeVideoChatAltProcessor,
  ],
})
export class YoutubeChatModule { }
