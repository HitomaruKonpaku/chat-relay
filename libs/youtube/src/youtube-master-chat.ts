import { Logger } from '@shared/logger/logger'
import { IterateChatOptions, Masterchat, MasterchatError } from 'masterchat'

export class YoutubeMasterchat extends Masterchat {
  private logger: Logger

  constructor(videoId: string) {
    super(videoId, '')
    this.logger = new Logger(`YoutubeMasterchat] [${videoId}`)
    this.addListeners()
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
