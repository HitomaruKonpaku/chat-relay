import { DatabaseQueueModule } from '@/app/database-queue'
import { MasterchatModule } from '@/app/masterchat'
import { UserModule } from '@/app/user'
import { YoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
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
  ],
})
export class YoutubeChatModule { }
