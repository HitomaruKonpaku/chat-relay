import { NumberUtil } from '@/shared/util/number.util'
import { ConfigService } from '@nestjs/config'
import { KeepJobs, Queue } from 'bullmq'
import ms from 'ms'

export abstract class BaseYoutubeChatQueueService<T> {
  protected removeOnComplete?: boolean | number | KeepJobs = {
    age: ms('4h') * 1e-3,
    count: NumberUtil.parse(this.configService.get('QUEUE_REMOVE_ON_COMPLETE_COUNT'), 100000),
  }

  protected removeOnFail?: boolean | number | KeepJobs = {
    age: ms('30d') * 1e-3,
    count: NumberUtil.parse(this.configService.get('QUEUE_REMOVE_ON_FAIL_COUNT'), 100000),
  }

  constructor(
    protected readonly configService: ConfigService,
    protected readonly queue: Queue<T>,
  ) { }
}
