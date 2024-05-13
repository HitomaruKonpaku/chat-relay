import { Logger } from '@shared/logger/logger'
import {
  Credentials,
  IterateChatOptions,
  Masterchat,
  MasterchatError,
} from 'masterchat'

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
    const credentials: Credentials = {
      APISID: process.env.YOUTUBE_APISID,
      HSID: process.env.YOUTUBE_HSID,
      SAPISID: process.env.YOUTUBE_SAPISID,
      SID: process.env.YOUTUBE_SID,
      SSID: process.env.YOUTUBE_SSID,

      '__Secure-1PAPISID': process.env.YOUTUBE_SAPISID,
      '__Secure-1PSID': process.env.YOUTUBE_1PSID,
      '__Secure-1PSIDTS': process.env.YOUTUBE_1PSIDTS,
      '__Secure-1PSIDCC': process.env.YOUTUBE_1PSIDCC,
    }

    this.logger.warn('[CREDENTIALS]')
    this.setCredentials(credentials)
  }

  public listen(iterateOptions?: IterateChatOptions) {
    const fn = super.listen(iterateOptions)
    this.logger.warn('[LISTEN]')
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
