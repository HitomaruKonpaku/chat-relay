import { Controller, Get, OnModuleInit } from '@nestjs/common'
import { BotService } from './bot.service'
import { DiscordService } from './module/discord/service/discord.service'

@Controller()
export class BotController implements OnModuleInit {
  constructor(
    private readonly botService: BotService,
    private readonly discordService: DiscordService,
  ) { }

  onModuleInit() {
    this.discordService.start()
  }

  @Get()
  getHello(): string {
    return this.botService.getHello()
  }
}
