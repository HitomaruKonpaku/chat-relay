import { DiscordModule } from '@app/discord'
import { TrackModule } from '@app/track'
import { Module } from '@nestjs/common'
import { YoutubeChatActionProcessor } from './processor/youtube-chat-action.processor'
import { YoutubeChatSuperChatProcessor } from './processor/youtube-chat-super-chat.processor'
import { YoutubeChatHandlerService } from './service/youtube-chat-handler.service'

@Module({
  imports: [
    TrackModule,
    DiscordModule,
  ],
  providers: [
    YoutubeChatHandlerService,

    YoutubeChatActionProcessor,
    YoutubeChatSuperChatProcessor,
  ],
  exports: [
  ],
})
export class YoutubeModule { }
