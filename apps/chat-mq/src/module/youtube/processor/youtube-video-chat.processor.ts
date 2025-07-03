import { DatabaseInsertQueueService } from '@/app/database-queue'
import { MasterchatService } from '@/app/masterchat'
import { UserPoolRepository } from '@/app/user'
import { YoutubeChatService, YoutubeVideoChatEndQueueService, YoutubeVideoService } from '@/app/youtube'
import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { YOUTUBE_VIDEO_CHAT_QUEUE_NAME } from '@/constant/youtube.constant'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'
import { BaseYoutubeVideoChatProcessor } from '../base/base-youtube-video-chat.processor'

@Processor(YOUTUBE_VIDEO_CHAT_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.YOUTUBE_VIDEO_CHAT_QUEUE_CONCURRENCY, 100),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class YoutubeVideoChatProcessor extends BaseYoutubeVideoChatProcessor {
  protected readonly logger = new Logger(YoutubeVideoChatProcessor.name)

  constructor(
    protected readonly configService: ConfigService,
    protected readonly databaseInsertQueueService: DatabaseInsertQueueService,
    protected readonly youtubeVideoChatEndQueueService: YoutubeVideoChatEndQueueService,
    protected readonly youtubeVideoService: YoutubeVideoService,
    protected readonly youtubeChatService: YoutubeChatService,
    protected readonly userPoolRepository: UserPoolRepository,
    protected readonly masterchatService: MasterchatService,
  ) {
    super(
      configService,
      databaseInsertQueueService,
      youtubeVideoChatEndQueueService,
      youtubeVideoService,
      youtubeChatService,
      userPoolRepository,
      masterchatService,
    )
  }
}
