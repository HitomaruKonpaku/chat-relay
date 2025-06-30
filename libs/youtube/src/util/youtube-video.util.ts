import { NumberUtil } from '@/shared/util/number.util'
import axios from 'axios'
import { toVideoId } from 'masterchat'
import { MediaInfo } from 'youtubei.js/dist/src/core/mixins'
import { YTNode } from 'youtubei.js/dist/src/parser/helpers'
import { GridVideo, PlayerLegacyDesktopYpcOffer, ReelItem, Video } from 'youtubei.js/dist/src/parser/nodes'
import { YoutubeVideo } from '..'

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

  public static parseMediaInfo(info: MediaInfo) {
    const data: YoutubeVideo = {
      id: info.basic_info.id,
      isActive: true,
      modifiedAt: Date.now(),
      channelId: info.basic_info.channel.id,
      privacyStatus: YoutubeVideoUtil.parsePrivacyStatus(info),
      isLiveContent: info.basic_info.is_live_content,
      title: info.basic_info.title,
      actualStart: NumberUtil.fromDate(info.basic_info.start_timestamp),
      actualEnd: NumberUtil.fromDate(info.basic_info.end_timestamp),
    }

    if (info.basic_info.is_upcoming) {
      data.scheduledStart = NumberUtil.fromDate(info.basic_info.start_timestamp)
    }

    if (data.isLiveContent) {
      data.isShortContent = false
    }

    if (['UNPLAYABLE'].includes(info.playability_status.status)) {
      const { type } = info.playability_status.error_screen
      if (type === 'PlayerLegacyDesktopYpcOffer') {
        const node = info.playability_status.error_screen as PlayerLegacyDesktopYpcOffer
        if (node.offer_id === 'sponsors_only_video') {
          data.isMembersOnly = true
        }
      }
    }

    return data
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

  public static async isShort(id: string) {
    const { status } = await axios.get(YoutubeVideoUtil.getShortUrl(id), {
      maxRedirects: 0,
      validateStatus: () => true,
    })

    if (status === 200) {
      return true
    }

    if (status === 303) {
      return false
    }

    return undefined
  }
}
