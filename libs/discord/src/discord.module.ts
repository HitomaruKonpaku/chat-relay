import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { QueueUtil } from '@shared/util/queue.util'
import { DISCORD_MESSAGE_RELAY_QUEUE_NAME } from './discord.constant'
import { DiscordService } from './discord.service'
import { DiscordMessageRelayQueueService } from './service/queue/discord-message-relay-queue.service'

const queues = [
  { name: DISCORD_MESSAGE_RELAY_QUEUE_NAME },
]

@Module({
  imports: [
    BullModule.registerQueue(
      ...QueueUtil.generateRegisterQueueOptions(queues.map((v) => v.name)),
    ),
  ],
  providers: [
    DiscordService,
    DiscordMessageRelayQueueService,
  ],
  exports: [
    DiscordService,
    DiscordMessageRelayQueueService,
  ],
})
export class DiscordModule { }
