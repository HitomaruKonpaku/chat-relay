import { DiscordModule } from '@/app/discord'
import { TrackModule } from '@/app/track'
import { YoutubeModule as XYoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { YoutubeChatActionProcessor } from './processor/youtube-chat-action.processor'
import { YoutubeChatBannerProcessor } from './processor/youtube-chat-banner.processor'
import { YoutubeChatMembershipProcessor } from './processor/youtube-chat-membership.processor'
import { YoutubeChatPollProcessor } from './processor/youtube-chat-poll.processor'
import { YoutubeChatSuperChatProcessor } from './processor/youtube-chat-super-chat.processor'
import { YoutubeVideoChatEndProcessor } from './processor/youtube-video-chat-end.processor'
import { YoutubeChatHandlerService } from './service/youtube-chat-handler.service'

@Module({
  imports: [
    TrackModule,
    DiscordModule,
    XYoutubeModule,
  ],
  providers: [
    YoutubeChatHandlerService,

    YoutubeVideoChatEndProcessor,
    YoutubeChatActionProcessor,
    YoutubeChatSuperChatProcessor,
    YoutubeChatMembershipProcessor,
    YoutubeChatPollProcessor,
    YoutubeChatBannerProcessor,
  ],
  exports: [
  ],
})
export class YoutubeModule { }
