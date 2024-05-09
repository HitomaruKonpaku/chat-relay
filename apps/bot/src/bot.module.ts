import { DatabaseModule } from '@app/database'
import { DiscordModule } from '@app/discord'
import { QueueModule } from '@app/queue'
import { Module } from '@nestjs/common'
import { BotController } from './bot.controller'
import { BotService } from './bot.service'
import { DiscordModule as InternalDiscordModule } from './module/discord/discord.module'

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    DiscordModule,

    InternalDiscordModule,
  ],
  controllers: [
    BotController,
  ],
  providers: [
    BotService,
  ],
})
export class BotModule { }
