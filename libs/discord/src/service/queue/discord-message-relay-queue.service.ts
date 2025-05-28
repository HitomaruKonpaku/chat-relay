import { DISCORD_MESSAGE_RELAY_QUEUE_NAME } from '@/constant/discord.constant'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import ms from 'ms'
import { DiscordMessageRelayJobData } from '../../interface/discord-message-relay-job-data.interface'

@Injectable()
export class DiscordMessageRelayQueueService {
  constructor(
    @InjectQueue(DISCORD_MESSAGE_RELAY_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async add(data: DiscordMessageRelayJobData, options?: JobsOptions) {
    const job = await this.queue.add(
      options?.jobId || 'message',
      data,
      {
        attempts: 3,
        removeOnComplete: {
          age: ms('8h') * 1e-3,
        },
        removeOnFail: {
          age: ms('30d') * 1e-3,
        },
        ...options,
      },
    )
    return job
  }
}
