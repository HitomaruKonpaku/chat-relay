import { Main } from '@/shared/base/base.main'
import { YoutubeChannelCrawlerModule } from './youtube-channel-crawler.module'

new Main(
  'youtube-channel-crawler',
  YoutubeChannelCrawlerModule,
).bootstrap()
