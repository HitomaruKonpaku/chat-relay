import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QueueUtil } from '@shared/util/queue.util'
import { YoutubeChannel } from './model/youtube-channel.entity'
import { YoutubeVideo } from './model/youtube-video.entity'
import { YoutubeChannelRepository } from './repository/youtube-channel.repository'
import { YoutubeVideoRepository } from './repository/youtube-video.repository'
import { InnertubeService } from './service/innertube.service'
import { YoutubeChatActionQueueService } from './service/queue/youtube-chat-action-queue.service'
import { YoutubeChatSuperChatQueueService } from './service/queue/youtube-chat-super-chat-queue.service'
import { YoutubeVideoChatQueueService } from './service/queue/youtube-video-chat-queue.service'
import { YoutubeChannelService } from './service/youtube-channel.service'
import { YoutubeChatService } from './service/youtube-chat.service'
import { YoutubeVideoService } from './service/youtube-video.service'
import {
  YOUTUBE_CHAT_ACTION_QUEUE_NAME,
  YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
} from './youtube.constant'
import { YoutubeService } from './youtube.service'

const queues = [
  { name: YOUTUBE_VIDEO_CHAT_QUEUE_NAME },
  { name: YOUTUBE_CHAT_ACTION_QUEUE_NAME },
  { name: YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME },
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YoutubeChannel,
      YoutubeVideo,
    ]),

    BullModule.registerQueue(
      ...QueueUtil.generateRegisterQueueOptions(queues.map((v) => v.name)),
    ),
  ],
  providers: [
    YoutubeService,

    YoutubeChannelRepository,
    YoutubeVideoRepository,

    YoutubeChannelService,
    YoutubeVideoService,
    YoutubeChatService,

    YoutubeVideoChatQueueService,
    YoutubeChatActionQueueService,
    YoutubeChatSuperChatQueueService,

    InnertubeService,
  ],
  exports: [
    YoutubeService,

    YoutubeChannelRepository,
    YoutubeVideoRepository,

    YoutubeChannelService,
    YoutubeVideoService,
    YoutubeChatService,

    YoutubeVideoChatQueueService,
    YoutubeChatActionQueueService,
    YoutubeChatSuperChatQueueService,

    InnertubeService,
  ],
})
export class YoutubeModule { }
