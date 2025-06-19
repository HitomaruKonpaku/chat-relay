import { Logger } from '@/shared/logger/logger'
import { AxiosRequestConfig } from 'axios'
import Bottleneck from 'bottleneck'
import { IterateChatOptions, Masterchat, MasterchatError } from 'masterchat'
import { YoutubeChatJobConfig } from './interface/youtube-chat-job-config.interface'
import { YoutubeUtil } from './util/youtube.util'

export class YoutubeMasterchat extends Masterchat {
  private readonly logger: Logger

  constructor(
    videoId: string,
    public readonly config?: YoutubeChatJobConfig,
    protected readonly httpLimiter?: Bottleneck,
  ) {
    super(videoId, '')
    this.logger = new Logger(`YoutubeMasterchat] [${videoId}`)
    this.config = config || {}
    this.httpLimiter = httpLimiter || new Bottleneck({})
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

  // #region override

  protected post<T>(input: string, body: any, config?: AxiosRequestConfig): Promise<T> {
    return this.httpLimiter.schedule(() => super.post<T>(input, body, config))
  }

  protected get<T>(input: string, config?: AxiosRequestConfig): Promise<T> {
    return this.httpLimiter.schedule(() => super.get<T>(input, config))
  }

  // #endregion
}
