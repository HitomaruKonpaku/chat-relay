import {
  YoutubeChannelUtil,
  YoutubeVideoChatQueueService,
  YoutubeVideoUtil,
} from '@app/youtube'
import { Injectable } from '@nestjs/common'
import { Logger } from '@shared/logger/logger'
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  bold,
  codeBlock,
  hyperlink,
} from 'discord.js'
import { Masterchat } from 'masterchat'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class YoutubeChatAddCommand extends BaseCommand {
  protected readonly logger = new Logger(YoutubeChatAddCommand.name)

  constructor(
    private readonly youtubeVideoChatQueueService: YoutubeVideoChatQueueService,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('youtube_chat_add')
    .setDescription('Add YouTube chat')
    .addStringOption((option) => option
      .setName('id')
      .setDescription('YouTube video id or url')
      .setRequired(true))
    .setDMPermission(false)

  public async execute(interaction: ChatInputCommandInteraction) {
    const id = YoutubeVideoUtil.parseId(interaction.options.getString('id'))

    try {
      const chat = await Masterchat.init(id)

      await this.youtubeVideoChatQueueService.add(chat.videoId)

      await interaction.editReply({
        embeds: [{
          title: chat.title,
          description: `${bold(hyperlink(chat.videoId, YoutubeVideoUtil.getUrl(chat.videoId)))} chat added`,
          color: 0x1d9bf0,
          author: {
            name: chat.channelName || chat.channelId,
            url: YoutubeChannelUtil.getUrl(chat.channelId),
          },
        }],
      })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, { id })
      await interaction.editReply(codeBlock(error.message))
    }
  }
}
