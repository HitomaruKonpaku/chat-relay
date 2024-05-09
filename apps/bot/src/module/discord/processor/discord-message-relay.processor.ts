import { DISCORD_MESSAGE_RELAY_QUEUE_NAME, DiscordMessageRelayJobData } from '@app/discord'
import { Processor } from '@nestjs/bullmq'
import { Inject, forwardRef } from '@nestjs/common'
import { BaseProcessor } from '@shared/base/base.processor'
import { Logger } from '@shared/logger/logger'
import { Job } from 'bullmq'
import { Guild, TextChannel } from 'discord.js'
import { DiscordService } from '../service/discord.service'

@Processor(DISCORD_MESSAGE_RELAY_QUEUE_NAME, {
  autorun: false,
  maxStalledCount: 100,
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
    if (guild) {
      this.log(job, `[GUILD] ${guild.id} >>> ${guild.name}`)
    }
    if (channel) {
      this.log(job, `[CHANNEL] ${channel.id} >>> #${channel.name}`)
    }
    const res = {
      id: msg.id,
      channel: { id: msg.channelId, name: channel?.name },
      guild: { id: msg.guildId, name: guild?.name },
    }
    return JSON.parse(JSON.stringify(res))
  }
}
