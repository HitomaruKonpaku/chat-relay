import { YoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { DISCORD_ALL_COMMANDS } from './constant/discord-command.constant'
import { DiscordMessageRelayProcessor } from './processor/discord-message-relay.processor'
import { DiscordClient } from './service/discord-client.service'
import { DiscordService } from './service/discord.service'

@Module({
  imports: [
    YoutubeModule,
  ],
  providers: [
    DiscordClient,
    DiscordService,

    DiscordMessageRelayProcessor,

    ...DISCORD_ALL_COMMANDS,
  ],
  exports: [
    DiscordClient,
    DiscordService,
  ],
})
export class DiscordModule { }
