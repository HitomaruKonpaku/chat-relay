export class YoutubeChannelUtil {
  public static parseCustomUrl(url: string) {
    const res = url
      ?.replace('http://www.youtube.com/', '')
    return res
  }

  public static parseThumbnailUrl(url: string): string {
    const res = url
    // ?.replace(/=s\d+.*/, '=s0')
    return res
  }
}
