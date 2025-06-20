import { Track } from '@/app/track'
import { YoutubeChatActionRepository } from '@/app/youtube'
import { Logger } from '@/shared/logger/logger'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { AddChatItemAction } from 'masterchat'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'
import { YoutubeChatRelayUtil } from '../util/youtube-chat-relay.util'

export class YoutubeAddChatItemActionHandler extends BaseChatActionHandler<AddChatItemAction, AddChatItemAction> {
  protected readonly logger = new Logger(YoutubeAddChatItemActionHandler.name)

  public getProcessAction(): AddChatItemAction {
    return this.action
  }

  public getTrackMessageIcons(track: Track): string[] {
    return YoutubeChatRelayUtil.getChatIcons(this.getProcessAction(), track)
  }

  public async save() {
    try {
      const canSave = false
        || this.action.isOwner
        || this.action.isModerator
        || this.action.isVerified
        || await this.hasTrackAuthor()
      if (canSave) {
        await super.save()
      }
    } catch (error) {
      this.logger.warn(`save: ${error.message} | ${JSON.stringify({ authorId: this.authorId, action: this.action })}`)
    }
  }

  private async hasTrackAuthor(): Promise<boolean> {
    const cache: Cache = this.getInstance(CACHE_MANAGER)
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

    const repo = this.getInstance(YoutubeChatActionRepository)
    const records: { id: string }[] = await repo.repository.query(query)
    await Promise.all(records.map((v) => cache.set(genIdKey(v.id), true)))
    await cache.set(okKey, true)

    const found = records.some((v) => v.id === this.authorId)
    return found
  }
}
