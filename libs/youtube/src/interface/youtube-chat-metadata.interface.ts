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

  metadata?: Record<string, any>
}
