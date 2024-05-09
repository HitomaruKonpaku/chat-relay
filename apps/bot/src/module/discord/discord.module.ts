import { Module } from '@nestjs/common'
import { DiscordMessageRelayProcessor } from './processor/discord-message-relay.processor'
import { DiscordClient } from './service/discord-client.service'
import { DiscordService } from './service/discord.service'

@Module({
  imports: [
  ],
  providers: [
    DiscordClient,
    DiscordService,

    DiscordMessageRelayProcessor,
  ],
  exports: [
    DiscordClient,
    DiscordService,
  ],
})
export class DiscordModule { }
