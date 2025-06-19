import { YoutubeChatActionJobData } from '@/app/youtube'
import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { YoutubeChatHandlerUtil } from '../util/youtube-chat-handler.util'

@Injectable()
export class YoutubeChatHandlerService {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) { }

  public async handleAction(data: YoutubeChatActionJobData<any>) {
    const handler = YoutubeChatHandlerUtil.initActionHandler(data, this.moduleRef)
    if (!handler) {
      throw new Error(`unhandleAction: ${data.action.type}`)
    }

    if (!data.config?.skipSave) {
      await handler.save()
    }

    if (!data.config?.skipHandle) {
      await handler.handle()
    }
  }
}
