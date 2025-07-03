import {
  InnertubeService,
  YoutubeChannel,
  YoutubeChannelRepository,
  YoutubeChannelUtil,
  YoutubeVideoChatAltQueueService,
  YoutubeVideoChatQueueService,
  YoutubeVideoRepository,
  YoutubeVideoService,
  YoutubeVideoUtil,
} from '@/app/youtube'
import { Injectable, NotFoundException } from '@nestjs/common'
import { IdDto } from '../dto/id.dto'

@Injectable()
export class QueueVideoService {
  constructor(
    private readonly youtubeChannelRepository: YoutubeChannelRepository,
    private readonly youtubeVideoRepository: YoutubeVideoRepository,
    private readonly innertubeService: InnertubeService,
    private readonly youtubeVideoService: YoutubeVideoService,
    private readonly youtubeVideoChatQueueService: YoutubeVideoChatQueueService,
    private readonly youtubeVideoChatAltQueueService: YoutubeVideoChatAltQueueService,
  ) { }

  async queue(body: IdDto) {
    const id = YoutubeVideoUtil.parseId(body.id)
    let job = await this.youtubeVideoChatQueueService.queue.getJob(id)
      || await this.youtubeVideoChatAltQueueService.queue.getJob(id)

    if (!job) {
      const info = await this.innertubeService.getVideo(id)
      if (!info.basic_info.id) {
        throw new NotFoundException('VIDEO_NOT_FOUND')
      }

      if (info.basic_info.channel?.id) {
        const data: YoutubeChannel = {
          id: info.basic_info.channel.id,
          name: info.basic_info.channel.name,
          customUrl: YoutubeChannelUtil.parseCustomUrl(info.basic_info.channel.url),
        }
        await this.youtubeChannelRepository.save(data)
      }

      const data = await this.youtubeVideoService.parseMediaInfo(info)
      await this.youtubeVideoRepository.save(data)

      if (info.basic_info.is_live || info.basic_info.is_upcoming) {
        job = await this.youtubeVideoChatQueueService.add(
          id,
          { priority: 999 },
        )
      } else {
        job = await this.youtubeVideoChatQueueService.add(
          id,
          { priority: 999 },
          {
            skipHandle: true,
            jobsOptions: { priority: 999 },
          },
        )
      }
    }

    return {
      id,
      job,
    }
  }
}
