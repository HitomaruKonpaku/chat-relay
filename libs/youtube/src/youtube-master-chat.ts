import { Logger } from '@shared/logger/logger'
import { IterateChatOptions, Masterchat, MasterchatError } from 'masterchat'
import { YoutubeUtil } from './util/youtube.util'

export class YoutubeMasterchat extends Masterchat {
  private logger: Logger

  constructor(videoId: string) {
    super(videoId, '')
    this.logger = new Logger(`YoutubeMasterchat] [${videoId}`)
    this.addListeners()
  }

  public get hasCredentials() {
    return !!this.credentials
  }

  public applyCredentials() {
    const credentials = YoutubeUtil.getCredentials()
    this.logger.warn('[CREDENTIALS]')
    this.setCredentials(credentials)
  }

  public listen(iterateOptions?: IterateChatOptions) {
    const fn = super.listen(iterateOptions)
    this.logger.log('[LISTEN]')
    return fn
  }

  private addListeners() {
    this.on('error', (error: MasterchatError) => {
      this.logger.error(`[ERROR] ${error.code} - ${error.message}`)
    })

    this.on('end', (reason) => {
      this.logger.warn(`[END] ${reason}`)
    })

    // this.on('actions', (actions) => {
    //   this.logger.debug(`[ACTIONS] ${actions.length}`)
    // })

    // this.on('chat', (chat) => {
    //   const name = YoutubeChatUtil.getAuthorName(chat)
    //   const message = stringify(chat.message) || ''
    //   this.logger.debug(`[MSG] ${name}: ${message}`)
    // })
  }
}
