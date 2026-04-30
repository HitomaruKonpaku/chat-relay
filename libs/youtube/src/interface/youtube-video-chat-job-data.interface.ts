import { YoutubeChatMetadata } from './youtube-chat-metadata.interface'

export interface YoutubeVideoChatJobData extends Partial<YoutubeChatMetadata> {
  videoId: string
}
