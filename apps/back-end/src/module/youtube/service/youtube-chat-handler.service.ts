import { YoutubeChatActionJobData } from '@/app/youtube'
import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { BaseChatActionHandler } from '../base/base-chat-action.handler'
import { BaseNotificationActionHandler } from '../base/base-notification-action.handler'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

@Injectable()
export class YoutubeChatHandlerService {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) { }

  public async handleAction(data: YoutubeChatActionJobData<any>) {
    const handler = YoutubeChatHandlerUtil.init(data, this.moduleRef)
    if (!handler) {
      throw new Error(`unhandleAction: ${data.action.type}`)
    }

    if (!data.config?.skipSave) {
      await handler.save()
    }

    if (!data.config?.skipHandle) {
      if (handler instanceof BaseNotificationActionHandler || handler instanceof BaseChatActionHandler) {
        await handler.handle()
      }
    }
  }
}
