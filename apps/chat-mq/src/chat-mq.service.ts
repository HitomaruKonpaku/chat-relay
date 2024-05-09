import { Injectable } from '@nestjs/common'

@Injectable()
export class ChatMqService {
  getHello(): string {
    return 'Hello World!'
  }
}
