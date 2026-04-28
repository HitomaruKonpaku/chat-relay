import { DatabaseModule } from '@/app/database'
import { HolodexModule } from '@/app/holodex'
import { QueueModule } from '@/app/queue'
import { UserModule } from '@/app/user'
import { YoutubeModule } from '@/app/youtube'
import { Module } from '@nestjs/common'
import { YoutubeChannelCrawlerController } from './youtube-channel-crawler.controller'
import { YoutubeChannelCrawlerService } from './youtube-channel-crawler.service'

@Module({
  imports: [
    QueueModule,
    DatabaseModule,
    UserModule,
    YoutubeModule,
    HolodexModule,
  ],
  controllers: [
    YoutubeChannelCrawlerController,
  ],
  providers: [
    YoutubeChannelCrawlerService,
  ],
})
export class YoutubeChannelCrawlerModule { }
