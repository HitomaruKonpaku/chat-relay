import { Track } from '@/app/track'
import { YoutubeChatAction, YoutubeChatActionRepository } from '@/app/youtube'
import { Logger } from '@/shared/logger/logger'
import { NumberUtil } from '@/shared/util/number.util'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { AddChatItemAction, stringify } from 'masterchat'
import { BaseActionHandler } from '../base/base-action-handler'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

export class YoutubeAddChatItemActionHandler extends BaseActionHandler<AddChatItemAction, AddChatItemAction> {
  protected readonly logger = new Logger(YoutubeAddChatItemActionHandler.name)

  getYoutubeChatAction(): YoutubeChatAction {
    return {
      ...this.action,
      id: this.action.id,
      createdAt: NumberUtil.fromDate(this.action.timestamp),
      modifiedAt: Date.now(),
      type: this.action.type,
      videoId: this.video.id,
      message: stringify(this.action.message),
    }
  }

  getProcessAction(): AddChatItemAction {
    return this.action
  }

  getIcons(track: Track): string[] {
    return YoutubeChatHandlerUtil.getChatIcons(this.getProcessAction(), track)
  }

  public async save(): Promise<void> {
    try {
      const found = await this.hasTrackAuthor()
      if (found) {
        await super.save()
      }
    } catch (error) {
      this.logger.warn(`hasTrackAuthor: ${error.message} | ${JSON.stringify({ authorId: this.authorId, action: this.action })}`)
    }
  }

  private async hasTrackAuthor(): Promise<boolean> {
    const cache: Cache = this.moduleRef.get(CACHE_MANAGER, { strict: false })
    if (!cache) {
      return false
    }

    const okKey = 'be:track:youtube:author.ok'
    const okValue = await cache.get<boolean>(okKey) || false
    const genIdKey = (id: string) => ['be:track:youtube:author', id].join(':')
    if (okValue) {
      const idKey = genIdKey(this.authorId)
      const found = await cache.get<boolean>(idKey) || false
      return found
    }

    const query = `
WITH author AS (
  (
    SELECT DISTINCT source_id AS id
    FROM track
    WHERE source_type = 'YOUTUBE'
      AND source_id NOTNULL
      AND source_id != ''
  )
  UNION
  (
    SELECT DISTINCT filter_id AS id
    FROM track
    WHERE source_type = 'YOUTUBE'
      AND filter_id NOTNULL
      AND filter_id != ''
  )
)
SELECT *
FROM author
      `

    const repo = this.moduleRef.get(YoutubeChatActionRepository, { strict: false })
    const records: { id: string }[] = await repo.repository.query(query)
    await Promise.all(records.map((v) => cache.set(genIdKey(v.id), true)))
    await cache.set(okKey, true)

    const found = records.some((v) => v.id === this.authorId)
    return found
  }
}
