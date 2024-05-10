import { DISCORD_MESSAGE_RELAY_QUEUE_NAME, DiscordMessageRelayJobData } from '@app/discord'
import { Processor } from '@nestjs/bullmq'
import { Inject, forwardRef } from '@nestjs/common'
import { BaseProcessor } from '@shared/base/base.processor'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import { Job } from 'bullmq'
import { Guild, TextChannel } from 'discord.js'
import { DiscordService } from '../service/discord.service'

@Processor(DISCORD_MESSAGE_RELAY_QUEUE_NAME, {
  autorun: false,
  maxStalledCount: 100,
  concurrency: NumberUtil.parse(process.env.DISCORD_MESSAGE_RELAY_QUEUE_CONCURRENCY, 1),
})
export class DiscordMessageRelayProcessor extends BaseProcessor {
  protected readonly logger = new Logger(DiscordMessageRelayProcessor.name)

  constructor(
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    const data = job.data as DiscordMessageRelayJobData
    const msg = await this.discordService.sendToChannel(data.channelId, data.content)
    const guild = msg.guild as Guild
    const channel = msg.channel as TextChannel
    const padLenght = 20
    if (guild) {
      job.log(`[GUILD  ] ${guild.id.padEnd(padLenght, ' ')} >>> ${guild.name}`)
    }
    if (channel) {
      job.log(`[CHANNEL] ${channel.id.padEnd(padLenght, ' ')} >>> #${channel.name}`)
    }
    const res = {
      id: msg.id,
      channel: { id: msg.channelId, name: channel?.name },
      guild: { id: msg.guildId, name: guild?.name },
    }
    return JSON.parse(JSON.stringify(res))
  }
}
