import { Controller, Get } from '@nestjs/common'
import { ChatMqService } from './chat-mq.service'

@Controller()
export class ChatMqController {
  constructor(private readonly chatMqService: ChatMqService) { }

  @Get()
  getHello(): string {
    return this.chatMqService.getHello()
  }
}
