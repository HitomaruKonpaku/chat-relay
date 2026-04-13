import { YTEmoji } from 'masterchat'

export interface YoutubeChatEmojiJobData {
  channel: {
    id: string
    name?: string
  },

  emoji: YTEmoji
}
