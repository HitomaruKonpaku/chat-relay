import { Logger } from '@/shared/logger/logger'
import { Inject, Injectable, forwardRef } from '@nestjs/common'
import {
  Channel,
  ChannelType,
  DMChannel,
  Guild,
  MessageCreateOptions,
  MessagePayload,
  TextChannel,
} from 'discord.js'
import { DiscordMessageRelayProcessor } from '../processor/discord-message-relay.processor'
import { DiscordClient } from './discord-client.service'

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name)

  constructor(
    private readonly client: DiscordClient,
    @Inject(forwardRef(() => DiscordMessageRelayProcessor))
    private readonly discordMessageRelayProcessor: DiscordMessageRelayProcessor,
  ) {
    this.addClientListeners()
  }

  public async start() {
    this.logger.log('Starting...')
    try {
      const token = process.env.DISCORD_TOKEN
      if (!token) {
        this.logger.error('DISCORD_TOKEN not found')
      }
      await this.client.login(token)
      this.logger.warn('Logged in!')
    } catch (error) {
      this.logger.error(`start: ${error.message}`)
    }
  }

  public async getGuild(id: string) {
    try {
      const guild = await this.client.guilds.fetch(id)
      this.logger.debug(`getGuild | ${JSON.stringify({ id, name: guild.name })}`)
      return guild
    } catch (error) {
      this.logger.error(`getGuild: ${error.message} | ${JSON.stringify({ id })}`)
      return null
    }
  }

  public async getChannel<T extends Channel>(id: string) {
    try {
      const channel = await this.client.channels.fetch(id) as any as T
      const meta = {
        id,
        isDMBased: channel.isDMBased(),
        isTextBased: channel.isTextBased(),
        isThread: channel.isThread(),
        isVoiceBased: channel.isVoiceBased(),
      }

      if (channel.type === ChannelType.GuildText) {
        this.logger.debug(`getChannel: GuildText | ${JSON.stringify({ id, name: channel.name, ...meta })}`)
      } else {
        this.logger.debug(`getChannel: Channel | ${JSON.stringify(meta)}`)
      }

      return channel
    } catch (error) {
      this.logger.error(`getChannel: ${error.message} | ${JSON.stringify({ id })}`)

      if (error.status === 404 && error.code === 10003) {
        // await this.trackService.deactivateByChannelId(id)
        //   .then(() => this.logger.debug('deactivateByChannelId', { id }))
        //   .catch((err) => this.logger.error(`deactivateByChannelId: ${err.message}`, { id }))
      }

      return null
    }
  }

  public async sendToChannel(
    channelId: string,
    options: string | MessagePayload | MessageCreateOptions,
    config?: { throwError?: boolean },
  ) {
    try {
      // Get channel
      const channel = await this.getChannel<Channel>(channelId)
      const canSend = channel
        && channel.isSendable()
      if (!canSend) {
        return null
      }

      let guild: Guild
      if (channel instanceof TextChannel) {
        // Try to save destination channel & guild
        // this.db.saveTextChannel(channel)
        guild = channel.guildId
          ? await this.getGuild(channel.guildId)
          : null
        if (guild) {
          // this.db.saveGuild(guild)
        }
      }

      // Send message
      const message = await channel.send(options)
      if (message) {
        if (channel instanceof TextChannel) {
          this.logger.debug(`Message was sent to ${guild.name ? `[${guild.name}]` : ''}[#${channel.name}] (${channelId})`)
        } else if (channel instanceof DMChannel) {
          this.logger.debug(`Message was sent to ${channel.recipient.tag}`)
        } else {
          this.logger.debug(`Message was sent to ${channel.toString()}`)
        }

        // this.discordDbService.saveMessage(message)

        // Crosspost message
        // if (message.channel.type === ChannelType.GuildAnnouncement) {
        //   await message.crosspost()
        //     .then(() => this.logger.debug('Crossposted message!'))
        //     .catch((error) => this.logger.error(`sendToChannel#crosspost: ${error.message}`, { channelId, messageId: message.id }))
        // }
      }

      // Return message
      return message
    } catch (error) {
      this.logger.error(`sendToChannel: ${error.message} | ${JSON.stringify({ channelId })}`)
      if (config?.throwError) {
        throw error
      }
    }

    return null
  }

  private addClientListeners() {
    const { client } = this

    client.once('ready', () => {
      this.saveClientGuilds()
      this.saveClientChannels()
    })

    client.once('ready', () => {
      this.startServices()
    })
  }

  // eslint-disable-next-line class-methods-use-this
  private async saveClientGuilds() {
    // this.client.guilds.cache.forEach((guild) => {
    //   this.db.saveGuild(guild)
    // })
  }

  private async saveClientChannels() {
    try {
      const channelIds = []
      this.client.channels.cache.forEach((channel) => {
        if (channelIds.includes(channel.id) && channel instanceof TextChannel) {
          // this.db.saveTextChannel(channel)
        }
      })
    } catch (error) {
      this.logger.error(`saveClientChannels: ${error.message}`)
    }
  }

  private startServices() {
    this.discordMessageRelayProcessor.worker.run()
  }
}
