import { DatabaseModule } from '@app/database'
import { DISCORD_MESSAGE_RELAY_QUEUE_NAME, DiscordModule } from '@app/discord'
import { QueueModule } from '@app/queue'
import { TrackModule } from '@app/track'
import { TwitchModule } from '@app/twitch'
import { UserModule } from '@app/user'
import {
  YOUTUBE_CHAT_ACTION_QUEUE_NAME,
  YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
  YoutubeModule,
} from '@app/youtube'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs'
import { Module } from '@nestjs/common'
import { BackEndController } from './back-end.controller'
import { BackEndService } from './back-end.service'
import { YoutubeModule as InternalYoutubeModule } from './module/youtube/youtube.module'

const queues = [
  { name: DISCORD_MESSAGE_RELAY_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_QUEUE_NAME },
  { name: YOUTUBE_CHAT_ACTION_QUEUE_NAME },
  { name: YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME },
]

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),

    BullBoardModule.forFeature(
      ...queues.map((v) => {
        const options: BullBoardQueueOptions = {
          ...v,
          adapter: BullMQAdapter,
        }
        return options
      }),
    ),

    DatabaseModule,
    QueueModule,
    UserModule,
    TrackModule,
    DiscordModule,
    YoutubeModule,
    TwitchModule,

    InternalYoutubeModule,
  ],
  controllers: [
    BackEndController,
  ],
  providers: [
    BackEndService,
  ],
})
export class BackEndModule { }
