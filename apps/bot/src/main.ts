import { Main } from '@/shared/base/base.main'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { BotCommandDeployer } from './bot-command-deployer'
import { BotModule } from './bot.module'

new Main(
  'bot',
  BotModule,
  {
    onBeforeListen: async () => {
      if (BooleanUtil.fromString(process.env.DISCORD_COMMAND_DEPLOY)) {
        await new BotCommandDeployer().deploy()
      }
    },
  },
).bootstrap()
