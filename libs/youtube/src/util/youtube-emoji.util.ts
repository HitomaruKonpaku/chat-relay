export class YoutubeEmojiUtil {
  public static parseChannelId(emojiId: string) {
    const channelId = /^UC[\w-]{22}(?=\/)/.exec(emojiId)?.[0]
    return channelId
  }
}
