import { YoutubeChatJobConfig } from './youtube-chat-job-config.interface'
import { YoutubeChatMetadata } from './youtube-chat-metadata.interface'

export interface YoutubeVideoChatJobData extends Partial<YoutubeChatMetadata> {
  videoId: string
  config?: YoutubeChatJobConfig
}
