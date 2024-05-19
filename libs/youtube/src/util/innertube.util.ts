import { C4TabbedHeader, PageHeader } from 'youtubei.js/dist/src/parser/nodes'
import { Channel } from 'youtubei.js/dist/src/parser/youtube'

export class InnertubeUtil {
  public static getTitle(channel: Channel): string {
    if (!channel.header) {
      return null
    }

    if (channel.header.type === 'PageHeader') {
      const header = channel.header as PageHeader
      return header.page_title
    }

    if (channel.header.type === 'C4TabbedHeader') {
      const header = channel.header as C4TabbedHeader
      return header.author?.name
    }

    return null
  }
}
