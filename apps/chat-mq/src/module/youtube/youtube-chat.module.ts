import { YoutubeModule } from '@app/youtube'
import { Module } from '@nestjs/common'
import { YoutubeVideoChatProcessor } from './processor/youtube-video-chat.processor'

@Module({
  imports: [
    YoutubeModule,
  ],
  providers: [
    YoutubeVideoChatProcessor,
  ],
})
export class YoutubeChatModule { }
