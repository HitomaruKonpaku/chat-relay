/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Logger } from '@/shared/logger/logger'
import { bold, ChatInputCommandInteraction, codeBlock, inlineCode } from 'discord.js'

export abstract class BaseCommand {
  protected abstract readonly logger: Logger

  public async execute(interaction: ChatInputCommandInteraction) {
    this.logger.debug('execute')
  }

  protected async isAppOwner(interaction: ChatInputCommandInteraction) {
    const app = await interaction.client.application.fetch()
    return app.owner.id === interaction.user.id
  }

  protected async replyOwnerOnly(interaction: ChatInputCommandInteraction) {
    const content = 'Owner only!'
    await interaction.editReply(content)
  }

  protected async replyUserMissingPermission(interaction: ChatInputCommandInteraction, permissionName: string) {
    const content = `You must have ${bold(inlineCode(permissionName))} permission to run this command!`
    await interaction.editReply(content)
  }

  protected async replyBotMissingPermission(interaction: ChatInputCommandInteraction, permissionName: string) {
    const content = `Missing ${bold(inlineCode(permissionName))} permission!`
    await interaction.editReply(content)
  }

  protected async replyUserNotFound(interaction: ChatInputCommandInteraction) {
    const content = 'User not found'
    await interaction.editReply(content)
  }

  protected async replyObject<T>(interaction: ChatInputCommandInteraction, data: T) {
    await interaction.editReply({ content: codeBlock('json', JSON.stringify(data, null, 2)) })
  }
}
