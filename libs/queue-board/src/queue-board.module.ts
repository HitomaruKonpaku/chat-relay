import {
  DATABASE_INSERT_QUEUE_NAME,
} from '@/constant/database.constant'
import {
  DISCORD_MESSAGE_RELAY_QUEUE_NAME,
} from '@/constant/discord.constant'
import {
  YOUTUBE_CHAT_ACTION_QUEUE_NAME,
  YOUTUBE_CHAT_BANNER_QUEUE_NAME,
  YOUTUBE_CHAT_ERROR_QUEUE_NAME,
  YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME,
  YOUTUBE_CHAT_POLL_QUEUE_NAME,
  YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME,
  YOUTUBE_CHAT_UNKNOWN_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_ALT_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
} from '@/constant/youtube.constant'
import { QueueUtil } from '@/shared/util/queue.util'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

const queues = [
  { name: DATABASE_INSERT_QUEUE_NAME },
  { name: DISCORD_MESSAGE_RELAY_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_ALT_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME },
  { name: YOUTUBE_CHAT_ERROR_QUEUE_NAME },
  { name: YOUTUBE_CHAT_UNKNOWN_QUEUE_NAME },
  { name: YOUTUBE_CHAT_ACTION_QUEUE_NAME },
  { name: YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME },
  { name: YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME },
  { name: YOUTUBE_CHAT_POLL_QUEUE_NAME },
  { name: YOUTUBE_CHAT_BANNER_QUEUE_NAME },
]

@Module({
  imports: [
    BullModule.registerQueue(
      ...QueueUtil.generateRegisterQueueOptions(queues.map((v) => v.name)),
    ),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      boardOptions: {
        uiConfig: {
          dateFormats: {
            short: 'HH:mm:ss',
            common: 'yyyy-MM-dd HH:mm:ss',
            full: 'yyyy-MM-dd HH:mm:ss',
          },
        },
      },
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
  ],
})
export class QueueBoardModule { }
