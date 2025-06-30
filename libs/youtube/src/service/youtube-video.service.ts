import { BaseService } from '@/shared/base/base.service'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Injectable } from '@nestjs/common'
import { Masterchat } from 'masterchat'
import { MediaInfo } from 'youtubei.js/dist/src/core/mixins'
import { PlayerErrorMessage } from 'youtubei.js/dist/src/parser/nodes'
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

  public async parseMediaInfo(info: MediaInfo) {
    const { id } = info.basic_info
    if (!id) {
      throw new Error('VIDEO_ID_NOT_FOUND')
    }

    const data = YoutubeVideoUtil.parseMediaInfo(info)
    if (!data.isLiveContent) {
      try {
        data.isShortContent = await YoutubeVideoUtil.isShort(id)
      } catch (error) {
        this.logger.warn(`isShort: ${error.message} | ${JSON.stringify({ id })}`)
      }
    }

    return data
  }

  public async updateMetadataMasterchat(id: string, isNew = false) {
    try {
      const mc = await Masterchat.init(id)
      const data: Partial<YoutubeVideo> = {
        id,
        createdAt: NumberUtil.fromDate(mc.videoMetadata?.datePublished),
        modifiedAt: Date.now(),
        channelId: mc.channelId,
        isMembersOnly: mc.isMembersOnly,
        title: mc.title,
        actualStart: NumberUtil.fromDate(mc.videoMetadata?.publication?.startDate),
        actualEnd: NumberUtil.fromDate(mc.videoMetadata?.publication?.endDate),
      }

      if (mc.isUpcoming) {
        data.scheduledStart = NumberUtil.fromDate(mc.videoMetadata?.publication?.startDate)
      }

      if (isNew) {
        await this.repository.repository.save(data)
      } else {
        await this.modify(id, data)
      }
    } catch (error) {
      this.logger.error(`updateMetadataMasterchat: ${error.message} | ${JSON.stringify({ id, error: JSON.stringify(error) })}`)
    }
  }

  public async updateMetadataInnertube(id: string, isNew = false) {
    try {
      const info = await this.innertubeService.getVideo(id)
      if (!info.basic_info.id) {
        if (info.playability_status.status === 'LOGIN_REQUIRED') {
          const { type } = info.playability_status.error_screen
          if (type === 'PlayerErrorMessage') {
            const node = info.playability_status.error_screen as PlayerErrorMessage
            this.logger.warn(`updateMetadataInnertube#PlayerErrorMessage: ${node.reason.text} | ${JSON.stringify({ id })}`)
            if (node.reason.text === 'Private video') {
              await this.modify(id, { isActive: true, privacyStatus: 'private' })
              return
            }
            if (node.reason.text === 'Sign in to confirm you’re not a bot') {
              return
            }
          }
        }
        await this.deactive(id)
        return
      }

      const data = await this.parseMediaInfo(info)
      if (isNew) {
        await this.repository.repository.save(data)
      } else {
        await this.modify(id, data)
      }
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
