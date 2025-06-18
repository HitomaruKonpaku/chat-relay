import { BaseService } from '@/shared/base/base.service'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Injectable } from '@nestjs/common'
import { Masterchat } from 'masterchat'
import { YoutubeVideo } from '../model/youtube-video.entity'
import { YoutubeVideoRepository } from '../repository/youtube-video.repository'
import { YoutubeVideoUtil } from '../util/youtube-video.util'
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

  public async modify(id: string, data: Partial<YoutubeVideo> = {}) {
    await this.repository.repository.update({ id }, {
      ...data,
      id,
      modifiedAt: Date.now(),
    })
  }

  public async deactive(id: string) {
    await this.modify(id, { isActive: false })
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
      await this.modify(id, data)
      this.logger.log(`updateMetadataMasterchat | ${JSON.stringify({ id })}`)
    } catch (error) {
      this.logger.error(`updateMetadataMasterchat: ${error.message} | ${JSON.stringify({ id })}`)
    }
  }

  public async updateMetadataInnertube(id: string) {
    try {
      const info = await this.innertubeService.getVideo(id)
      if (!info.basic_info.id) {
        if (info.playability_status.status === 'LOGIN_REQUIRED') {
          await this.modify(id, { isActive: true, privacyStatus: 'private' })
          return
        }
        await this.deactive(id)
        return
      }

      const data: Partial<YoutubeVideo> = {
        isActive: true,
        modifiedAt: Date.now(),
        privacyStatus: YoutubeVideoUtil.parsePrivacyStatus(info),
        isLiveContent: info.basic_info.is_live_content,
        title: info.basic_info.title,
      }
      await this.modify(id, data)
      this.logger.log(`updateMetadataInnertube | ${JSON.stringify({ id })}`)
    } catch (error) {
      this.logger.error(`updateMetadataInnertube: ${error.message} | ${JSON.stringify({ id })}`)
      if (error.info?.reason) {
        await this.modify(id, { isActive: false, errorReason: error.info.reason })
        return
      }
      this.logger.warn(`updateMetadataInnertube#unhandled: ${error.message} | ${JSON.stringify({ id, error: JSON.stringify(error) })}`)
    }
  }
}
