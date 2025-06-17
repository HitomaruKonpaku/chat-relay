import { BaseService } from '@/shared/base/base.service'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Injectable } from '@nestjs/common'
import { Masterchat } from 'masterchat'
import { YoutubeVideo } from '../model/youtube-video.entity'
import { YoutubeVideoRepository } from '../repository/youtube-video.repository'
import { InnertubeService } from './innertube.service'

@Injectable()
export class YoutubeVideoService extends BaseService<YoutubeVideo> {
  private readonly logger = new Logger(YoutubeVideoService.name)

  constructor(
    public readonly repository: YoutubeVideoRepository,
    public readonly innertubeService: InnertubeService,
  ) {
    super(repository)
  }

  public async modified(id: string) {
    await this.repository.repository.update({ id }, {
      modifiedAt: Date.now(),
    })
  }

  public async deactive(id: string) {
    await this.repository.repository.update({ id }, {
      isActive: false,
      modifiedAt: Date.now(),
    })
  }

  public async updateMetadataMasterchat(id: string) {
    try {
      const mc = await Masterchat.init(id)
      const data: Partial<YoutubeVideo> = {
        createdAt: NumberUtil.fromDate(mc.videoMetadata?.datePublished),
        modifiedAt: Date.now(),
        isMembersOnly: mc.isMembersOnly,
        title: mc.title,
        actualStart: NumberUtil.fromDate(mc.videoMetadata?.publication?.startDate),
        actualEnd: NumberUtil.fromDate(mc.videoMetadata?.publication?.endDate),
      }
      await this.repository.repository.update({ id }, data)
      this.logger.log(`updateMetadataMasterchat | ${JSON.stringify({ id })}`)
    } catch (error) {
      this.logger.error(`updateMetadataMasterchat: ${error.message} | ${JSON.stringify({ id })}`)
    }
  }

  public async updateMetadataInnertube(id: string) {
    try {
      const { basic_info: info } = await this.innertubeService.getVideo(id)
      if (!info.id) {
        await this.deactive(id)
        return
      }

      const data: Partial<YoutubeVideo> = {
        isActive: true,
        modifiedAt: Date.now(),
        isLiveContent: info.is_live_content,
      }
      await this.repository.repository.update({ id }, data)
      this.logger.log(`updateMetadataInnertube | ${JSON.stringify({ id })}`)
    } catch (error) {
      this.logger.error(`updateMetadataInnertube: ${error.message} | ${JSON.stringify({ id })}`)
      const reasons = [
        'Video unavailable',
        'This video has been removed for violating YouTube\'s Terms of Service',
        'This video has been removed for violating YouTube\'s policy on nudity or sexual content',
      ]
      if (reasons.some((v) => v === error.info.reason)) {
        await this.deactive(id)
      }
    }
  }
}
