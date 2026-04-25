import { YT, YTNodes } from 'youtubei.js'

export class InnertubeUtil {
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
