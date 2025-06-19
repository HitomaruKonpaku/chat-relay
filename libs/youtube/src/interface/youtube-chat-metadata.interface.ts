import { VideoObject } from 'masterchat'
import { YoutubeChatJobConfig } from './youtube-chat-job-config.interface'

export interface YoutubeChatMetadata {
  channel: {
    id: string
    name?: string
  },

  video: {
    id: string
    title?: string
    isLive?: boolean
    isUpcoming?: boolean
    isMembersOnly?: boolean
  },

  config?: YoutubeChatJobConfig

  metadata?: VideoObject
}
