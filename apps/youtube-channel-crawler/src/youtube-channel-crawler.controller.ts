import { Controller, Get } from '@nestjs/common'
import { YoutubeChannelCrawlerService } from './youtube-channel-crawler.service'

@Controller()
export class YoutubeChannelCrawlerController {
  constructor(private readonly youtubeChannelCrawlerService: YoutubeChannelCrawlerService) { }

  @Get()
  getHello(): string {
    return this.youtubeChannelCrawlerService.getHello()
  }
}
