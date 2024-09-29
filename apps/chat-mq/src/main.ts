import { Main } from '@/shared/base/base.main'
import { ChatMqModule } from './chat-mq.module'

new Main(
  'chat-mq',
  ChatMqModule,
).bootstrap()
