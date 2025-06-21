import { DatabaseInsertQueueService } from '@/app/database-queue'
import { UserSourceType } from '@/app/user'
import { BaseAction, YoutubeChatAction, YoutubeChatActionJobData } from '@/app/youtube'
import { NumberUtil } from '@/shared/util/number.util'
import { Type } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Action, Badges, Membership } from 'masterchat'

type YCA = YoutubeChatAction & Partial<Badges>

export abstract class BaseActionHandler<T extends Action, R extends Action = T> {
  constructor(
    protected readonly data: YoutubeChatActionJobData<T>,
    protected readonly moduleRef: ModuleRef,
  ) { }

  protected get channel() {
    return this.data.channel
  }

  protected get video() {
    return this.data.video
  }

  protected get action() {
    return this.data.action
  }

  protected get videoId() {
    return this.video.id
  }

  protected get hostId() {
    return this.channel.id
  }

  public getMainAction(): R {
    return this.action as any
  }

  /**
   * Transform `action` to `YoutubeChatAction`
   */
  public getYoutubeChatAction(): YoutubeChatAction {
    const action = this.getMainAction() as BaseAction
    if (!action.id) {
      throw new Error('ID_NOT_FOUND')
    }

    const yca: YoutubeChatAction = {
      ...action,
      id: action.id,
      createdAt: NumberUtil.fromDate(action.timestamp),
      modifiedAt: Date.now(),
      type: action.type,
      videoId: this.video.id,
      message: this.getYoutubeChatActionMessage(),
    }

    return yca
  }

  public getYoutubeChatActionMessage(): string {
    return undefined
  }

  public async save() {
    if (!this.canSave()) {
      return
    }

    const data: YCA = this.getYoutubeChatAction()
    const membership: Membership = data.membership
      || (this.action as any).membership
    if (membership) {
      data.membershipStatus = membership.status
      data.membershipSince = membership.since
    }

    const service = this.getInstance(DatabaseInsertQueueService)
    await service.add(
      { table: 'youtube_chat_action', data },
      this.data.config?.jobsOptions,
    )
  }

  protected canSave(): boolean {
    return true
  }

  protected getInstance<TInput = any>(token: Type<TInput> | string): TInput {
    const res = this.moduleRef.get(token, { strict: false })
    return res
  }

  protected getMetadata() {
    const action = this.data.action as BaseAction
    const res = {
      source: UserSourceType.YOUTUBE,
      channel: this.data.channel,
      video: this.data.video,
      action: {
        id: action.id,
        type: action.type,
      },
    }
    return res
  }
}
