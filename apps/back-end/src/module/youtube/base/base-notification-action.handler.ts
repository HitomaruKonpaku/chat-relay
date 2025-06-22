import { NotificationAction, YoutubeVideoUtil } from '@/app/youtube'
import { codeBlock, hideLinkEmbed, hyperlink, inlineCode } from 'discord.js'
import { YoutubeChatHandlerService } from '../service/youtube-chat-handler.service'
import { BaseActionHandler } from './base-action.handler'

export abstract class BaseNotificationActionHandler<T extends NotificationAction> extends BaseActionHandler<T> {
  public async handle() {
    if (!this.canHandle()) {
      return
    }

    const content = this.getContent()
    const metadata = this.getMetadata()

    const service = this.getInstance(YoutubeChatHandlerService)
    await service.handleNotification(this.data, { payload: content, metadata })
  }

  protected canHandle(): boolean {
    return false
  }

  protected getContent() {
    const lines: string[] = []

    const link = hyperlink(
      this.data.video.id,
      hideLinkEmbed(YoutubeVideoUtil.getUrl(this.data.video.id)),
      [
        this.data.channel.name || this.data.channel.id,
        this.data.video.title || this.data.video.id,
      ].join('\n'),
    )

    lines.push(`「${link}」 ${inlineCode(this.data.action.type)}`)

    lines.push(codeBlock(this.getYoutubeChatActionMessage()))

    const res = lines.join('\n')
    return res
  }
}
