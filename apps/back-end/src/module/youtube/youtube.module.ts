import { DiscordModule } from '@app/discord'
import { TrackModule } from '@app/track'
import { Module } from '@nestjs/common'
import { YoutubeChatActionProcessor } from './processor/youtube-chat-action.processor'
import { YoutubeChatMembershipProcessor } from './processor/youtube-chat-membership.processor'
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
    YoutubeChatMembershipProcessor,
  ],
  exports: [
  ],
})
export class YoutubeModule { }
