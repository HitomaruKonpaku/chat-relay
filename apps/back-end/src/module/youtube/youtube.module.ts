import { DiscordModule } from '@/app/discord'
import { TrackModule } from '@/app/track'
import { YoutubeModule as XYoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { YoutubeChatActionProcessor } from './processor/youtube-chat-action.processor'
import { YoutubeChatBannerSummaryProcessor } from './processor/youtube-chat-banner-summary.processor'
import { YoutubeChatBannerProcessor } from './processor/youtube-chat-banner.processor'
import { YoutubeChatEmojiProcessor } from './processor/youtube-chat-emoji.processor'
import { YoutubeChatMembershipProcessor } from './processor/youtube-chat-membership.processor'
import { YoutubeChatPollProcessor } from './processor/youtube-chat-poll.processor'
import { YoutubeChatSuperChatProcessor } from './processor/youtube-chat-super-chat.processor'
import { YoutubeVideoChatEndProcessor } from './processor/youtube-video-chat-end.processor'
import { YoutubeChatEmojiHandlerService } from './service/youtube-chat-emoji-handler.service'
import { YoutubeChatHandlerService } from './service/youtube-chat-handler.service'

@Module({
  imports: [
    TrackModule,
    DiscordModule,
    XYoutubeModule,
  ],
  providers: [
    YoutubeChatHandlerService,
    YoutubeChatEmojiHandlerService,

    YoutubeVideoChatEndProcessor,
    YoutubeChatActionProcessor,
    YoutubeChatSuperChatProcessor,
    YoutubeChatMembershipProcessor,
    YoutubeChatPollProcessor,
    YoutubeChatBannerProcessor,
    YoutubeChatBannerSummaryProcessor,
    YoutubeChatEmojiProcessor,
  ],
  exports: [
    YoutubeChatHandlerService,
    YoutubeChatEmojiHandlerService,
  ],
})
export class YoutubeModule { }
