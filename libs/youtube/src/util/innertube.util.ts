import { YT, YTNodes } from 'youtubei.js'
import { YoutubeVideoUtil } from './youtube-video.util'

type InnertubeVideo = YTNodes.CompactVideo
  | YTNodes.GridVideo
  | YTNodes.PlaylistPanelVideo
  | YTNodes.PlaylistVideo
  | YTNodes.ReelItem
  | YTNodes.ShortsLockupView
  | YTNodes.Video
  | YTNodes.WatchCardCompactVideo

export class InnertubeUtil {
  public static findActiveVideoIds(channel: YT.Channel): string[] {
    const ids: string[] = []
    ids.push(...InnertubeUtil.findActiveVideoIdsByChannelMemo(channel))
    ids.push(...InnertubeUtil.findActiveVideoIdsByChannelVideos(channel))
    return ids
  }

  public static isLiveOrUpcomingLockupView(view: YTNodes.LockupView) {
    const isLiveByBadge = () => (view.content_image as any)
      ?.overlays
      ?.some((overlay: any) => overlay
        && overlay.type === 'ThumbnailBottomOverlayView'
        && overlay.badges?.length
        && overlay.badges.some((badge: any) => badge
          && badge.type === 'ThumbnailBadgeView'
          && (
            false
            || badge.badge_style === 'THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE'
            || badge.text === 'LIVE'
            || badge.text === 'Upcoming'
          )))

    const isLiveByText = () => view.metadata?.metadata?.metadata_rows
      ?.some((mr) => mr.metadata_parts
        ?.some((part) => {
          const text = part.text?.text || ''
          return !part.text?.endpoint
            && (
              false
              || text.startsWith('Scheduled for ')
              || text.startsWith('Premieres ')
              || text.endsWith(' waiting')
              || text.endsWith(' watching')
            )
        }))

    return isLiveByBadge() || isLiveByText()
  }

  public static findActiveVideoIdsByChannelMemo(channel: YT.Channel): string[] {
    const views = (channel?.memo?.get('LockupView') || []) as YTNodes.LockupView[]
    const subViews = views.filter((view) => InnertubeUtil.isLiveOrUpcomingLockupView(view))
    const ids = subViews.map((view) => view.content_id)
    return ids
  }

  public static findActiveVideoIdsByChannelVideos(channel: YT.Channel): string[] {
    const ids = (channel?.videos || [])
      .filter((v) => InnertubeUtil.filterActiveVideo(v))
      .map((v) => v.id)
    return ids
  }

  public static filterActiveVideo(video: InnertubeVideo): boolean {
    if (YoutubeVideoUtil.isVideo(video)) {
      if (video.is_upcoming || video.is_live) {
        return true
      }
    }

    if (YoutubeVideoUtil.isGridVideo(video)) {
      if (video.is_upcoming || video.duration?.text === 'LIVE') {
        return true
      }
    }

    return false
  }

  public static getTitle(channel: YT.Channel): string {
    if (!channel.header) {
      return null
    }

    if (channel.header.type === 'PageHeader') {
      const header = channel.header as YTNodes.PageHeader
      return header.page_title
    }

    if (channel.header.type === 'C4TabbedHeader') {
      const header = channel.header as YTNodes.C4TabbedHeader
      return header.author?.name
    }

    return null
  }
}
