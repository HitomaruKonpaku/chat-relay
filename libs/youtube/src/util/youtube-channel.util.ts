export class YoutubeChannelUtil {
  public static getUrl(id: string) {
    const url = `https://www.youtube.com/channel/${id}`
    return url
  }

  public static parseCustomUrl(url: string) {
    if (!url) {
      return undefined
    }
    const res = decodeURI(url.replace('http://www.youtube.com/', ''))
    return res
  }

  public static parseThumbnailUrl(url: string): string {
    const res = url
    // ?.replace(/=s\d+.*/, '=s0')
    return res
  }
}
