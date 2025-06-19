import { BaseService } from '@/shared/base/base.service'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { Masterchat } from 'masterchat'
import { PlayerErrorMessage, PlayerLegacyDesktopYpcOffer } from 'youtubei.js/dist/src/parser/nodes'
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

      if (mc.isUpcoming) {
        data.scheduledStart = NumberUtil.fromDate(mc.videoMetadata?.publication?.startDate)
      }

      await this.modify(id, data)
    } catch (error) {
      this.logger.error(`updateMetadataMasterchat: ${error.message} | ${JSON.stringify({ id, error: JSON.stringify(error) })}`)
    }
  }

  public async updateMetadataInnertube(id: string) {
    try {
      const info = await this.innertubeService.getVideo(id)
      if (!info.basic_info.id) {
        if (info.playability_status.status === 'LOGIN_REQUIRED') {
          const { type } = info.playability_status.error_screen
          if (type === 'PlayerErrorMessage') {
            const node = info.playability_status.error_screen as PlayerErrorMessage
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

      const data: Partial<YoutubeVideo> = {
        isActive: true,
        modifiedAt: Date.now(),
        privacyStatus: YoutubeVideoUtil.parsePrivacyStatus(info),
        isLiveContent: info.basic_info.is_live_content,
        title: info.basic_info.title,
        actualStart: NumberUtil.fromDate(info.basic_info.start_timestamp),
        actualEnd: NumberUtil.fromDate(info.basic_info.end_timestamp),
      }

      if (info.basic_info.is_upcoming) {
        data.scheduledStart = NumberUtil.fromDate(info.basic_info.start_timestamp)
      }

      if (info.playability_status.status === 'UNPLAYABLE') {
        const { type } = info.playability_status.error_screen
        if (type === 'PlayerLegacyDesktopYpcOffer') {
          const node = info.playability_status.error_screen as PlayerLegacyDesktopYpcOffer
          if (node.offer_id === 'sponsors_only_video') {
            data.isMembersOnly = true
          }
        }
      }

      if (info.playability_status.status === 'OK') {
        if (!info.basic_info.is_live_content) {
          try {
            data.isShortContent = await this.isShort(id)
          } catch (error) {
            this.logger.warn(`isShort: ${error.message} | ${JSON.stringify({ id })}`)
          }
        }
      }

      await this.modify(id, data)
    } catch (error) {
      this.logger.error(`updateMetadataInnertube: ${error.message} | ${JSON.stringify({ id })}`)
      if (error.info?.reason) {
        await this.modify(id, { isActive: false, errorReason: error.info.reason })
        return
      }
      this.logger.warn(`updateMetadataInnertube#unhandled: ${error.message} | ${JSON.stringify({ id, error: JSON.stringify(error) })}`)
    }
  }

  public async isShort(id: string) {
    const { status } = await axios.get(YoutubeVideoUtil.getShortUrl(id), {
      maxRedirects: 0,
      validateStatus: () => true,
    })

    if (status === 200) {
      return true
    }

    if (status === 303) {
      return false
    }

    return undefined
  }
}
