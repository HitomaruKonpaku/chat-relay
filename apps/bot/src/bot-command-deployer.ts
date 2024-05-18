import { Logger } from '@shared/logger/logger'
import { REST, Routes } from 'discord.js'
import { DISCORD_GLOBAL_COMMANDS } from './module/discord/constant/discord-command.constant'

export class BotCommandDeployer {
  protected readonly logger = new Logger(BotCommandDeployer.name)

  public async deploy() {
    const token = process.env.DISCORD_TOKEN
    const appId = process.env.DISCORD_APP_ID
    // const guildId = process.env.DISCORD_GUILD_ID

    if (!token) {
      this.logger.error('Bot token not found')
      process.exit(1)
    }

    const rest = new REST({ version: '9' }).setToken(token)
    this.logger.log('deploying...')

    // try {
    //   const commands = DISCORD_GUILD_COMMANDS
    //     .map((v) => v.command)
    //     .map((command) => command.toJSON())
    //   await rest.put(
    //     Routes.applicationGuildCommands(appId, guildId),
    //     { body: commands },
    //   )
    //   this.logger.log('Successfully registered application guild commands')
    // } catch (error) {
    //   this.logger.error(`deployApplicationGuildCommands: ${error.message}`)
    // }

    try {
      const commands = DISCORD_GLOBAL_COMMANDS
        .map((v) => v.command)
        .map((command) => command.toJSON())
      await rest.put(
        Routes.applicationCommands(appId),
        { body: commands },
      )
      this.logger.log('Successfully registered application global commands')
    } catch (error) {
      this.logger.error(`deloyApplicationGlobalCommands: ${error.message}`)
    }
  }
}
