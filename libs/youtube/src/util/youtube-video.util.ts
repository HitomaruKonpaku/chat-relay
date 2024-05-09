import { toVideoId } from 'masterchat'

export class YoutubeVideoUtil {
  public static parseId(videoIdOrUrl: string): string {
    const id = toVideoId(videoIdOrUrl)
    return id
  }

  public static getUrl(videoId: string) {
    const url = `https://www.youtube.com/watch?v=${videoId}`
    return url
  }
}
