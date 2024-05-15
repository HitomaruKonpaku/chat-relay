import { YoutubeChatMetadata } from './youtube-chat-metadata.interface'

export interface YoutubeVideoChatEndJobData extends YoutubeChatMetadata {
  id: string
  endReason: string
}
