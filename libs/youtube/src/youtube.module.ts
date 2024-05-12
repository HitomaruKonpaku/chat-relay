import { DatabaseQueueModule } from '@app/database-queue'
import { UserModule } from '@app/user'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QueueUtil } from '@shared/util/queue.util'
import { YoutubeChannel } from './model/youtube-channel.entity'
import { YoutubeChatAction } from './model/youtube-chat-action.entity'
import { YoutubeVideo } from './model/youtube-video.entity'
import { YoutubeChannelRepository } from './repository/youtube-channel.repository'
import { YoutubeChatActionRepository } from './repository/youtube-chat-action.repository'
import { YoutubeVideoRepository } from './repository/youtube-video.repository'
import { InnertubeService } from './service/innertube.service'
import { YoutubeChatActionQueueService } from './service/queue/youtube-chat-action-queue.service'
import { YoutubeChatMembershipQueueService } from './service/queue/youtube-chat-membership-queue.service'
import { YoutubeChatPollQueueService } from './service/queue/youtube-chat-poll-queue.service'
import { YoutubeChatSuperChatQueueService } from './service/queue/youtube-chat-super-chat-queue.service'
import { YoutubeVideoChatQueueService } from './service/queue/youtube-video-chat-queue.service'
import { YoutubeChannelService } from './service/youtube-channel.service'
import { YoutubeChatService } from './service/youtube-chat.service'
import { YoutubeVideoService } from './service/youtube-video.service'
import {
  YOUTUBE_CHAT_ACTION_QUEUE_NAME,
  YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME,
  YOUTUBE_CHAT_POLL_QUEUE_NAME,
  YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
} from './youtube.constant'
import { YoutubeService } from './youtube.service'

const queues = [
  { name: YOUTUBE_VIDEO_CHAT_QUEUE_NAME },
  { name: YOUTUBE_CHAT_ACTION_QUEUE_NAME },
  { name: YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME },
  { name: YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME },
  { name: YOUTUBE_CHAT_POLL_QUEUE_NAME },
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YoutubeChannel,
      YoutubeVideo,
      YoutubeChatAction,
    ]),

    BullModule.registerQueue(
      ...QueueUtil.generateRegisterQueueOptions(queues.map((v) => v.name)),
    ),

    DatabaseQueueModule,

    UserModule,
  ],
  providers: [
    YoutubeService,

    YoutubeChannelRepository,
    YoutubeVideoRepository,
    YoutubeChatActionRepository,

    YoutubeChannelService,
    YoutubeVideoService,
    YoutubeChatService,

    YoutubeVideoChatQueueService,
    YoutubeChatActionQueueService,
    YoutubeChatSuperChatQueueService,
    YoutubeChatMembershipQueueService,
    YoutubeChatPollQueueService,

    InnertubeService,
  ],
  exports: [
    YoutubeService,

    YoutubeChannelRepository,
    YoutubeVideoRepository,
    YoutubeChatActionRepository,

    YoutubeChannelService,
    YoutubeVideoService,
    YoutubeChatService,

    YoutubeVideoChatQueueService,
    YoutubeChatActionQueueService,
    YoutubeChatSuperChatQueueService,
    YoutubeChatMembershipQueueService,
    YoutubeChatPollQueueService,

    InnertubeService,
  ],
})
export class YoutubeModule { }
