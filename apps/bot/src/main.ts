import { Main } from '@shared/base/base.main'
import { BotModule } from './bot.module'

new Main(
  'bot',
  BotModule,
).bootstrap()
