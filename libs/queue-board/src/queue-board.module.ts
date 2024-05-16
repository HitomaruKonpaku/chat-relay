import { DATABASE_INSERT_QUEUE_NAME } from '@app/database-queue'
import { DISCORD_MESSAGE_RELAY_QUEUE_NAME } from '@app/discord'
import {
  YOUTUBE_CHAT_ACTION_QUEUE_NAME,
  YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME,
  YOUTUBE_CHAT_POLL_QUEUE_NAME,
  YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
} from '@app/youtube'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { QueueUtil } from '@shared/util/queue.util'

const queues = [
  { name: DATABASE_INSERT_QUEUE_NAME },
  { name: DISCORD_MESSAGE_RELAY_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_END_QUEUE_NAME },
  { name: YOUTUBE_CHAT_ACTION_QUEUE_NAME },
  { name: YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME },
  { name: YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME },
  { name: YOUTUBE_CHAT_POLL_QUEUE_NAME },
]

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),

    BullModule.registerQueue(
      ...QueueUtil.generateRegisterQueueOptions(queues.map((v) => v.name)),
    ),

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
