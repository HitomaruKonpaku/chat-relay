import { DISCORD_MESSAGE_RELAY_QUEUE_NAME } from '@app/discord'
import {
  YOUTUBE_CHAT_ACTION_QUEUE_NAME,
  YOUTUBE_CHAT_MEMBERSHIP_QUEUE_NAME,
  YOUTUBE_CHAT_POLL_QUEUE_NAME,
  YOUTUBE_CHAT_SUPER_CHAT_QUEUE_NAME,
  YOUTUBE_VIDEO_CHAT_QUEUE_NAME,
} from '@app/youtube'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs'
import { Module } from '@nestjs/common'

const queues = [
  { name: DISCORD_MESSAGE_RELAY_QUEUE_NAME },
  { name: YOUTUBE_VIDEO_CHAT_QUEUE_NAME },
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
