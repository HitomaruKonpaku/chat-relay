import { MessageCreateOptions, MessagePayload } from 'discord.js'

export interface DiscordMessageRelayJobData {
  channelId: string
  payload: string | MessagePayload | MessageCreateOptions
  metadata?: Record<string, any>
}
