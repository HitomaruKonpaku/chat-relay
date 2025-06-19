import { toVideoId } from 'masterchat'
import { MediaInfo } from 'youtubei.js/dist/src/core/mixins'
import { YTNode } from 'youtubei.js/dist/src/parser/helpers'
import { GridVideo, ReelItem, Video } from 'youtubei.js/dist/src/parser/nodes'

export class YoutubeVideoUtil {
  public static getUrl(id: string) {
    const url = `https://www.youtube.com/watch?v=${id}`
    return url
  }
  public static getShortUrl(id: string) {
    const url = `https://www.youtube.com/shorts/${id}`
    return url
  }

  public static parseId(videoIdOrUrl: string): string {
    const id = toVideoId(videoIdOrUrl)
    return id
  }

  public static isVideo(video: YTNode): video is Video {
    return video.type === 'Video'
  }

  public static isGridVideo(video: YTNode): video is GridVideo {
    return video.type === 'GridVideo'
  }

  public static isReelItem(video: YTNode): video is ReelItem {
    return video.type === 'ReelItem'
  }

  public static parsePrivacyStatus(info: MediaInfo) {
    if (info.basic_info.is_private) {
      return 'private'
    }
    if (info.basic_info.is_unlisted) {
      return 'unlisted'
    }
    return 'public'
  }
}
