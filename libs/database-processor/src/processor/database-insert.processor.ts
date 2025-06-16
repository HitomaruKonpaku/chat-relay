import { DatabaseInsertData } from '@/app/database-queue'
import { QUEUE_MAX_STALLED_COUNT } from '@/constant/common.constant'
import { DATABASE_INSERT_QUEUE_NAME } from '@/constant/database.constant'
import { BaseProcessor } from '@/shared/base/base.processor'
import { Logger } from '@/shared/logger/logger'
import { BooleanUtil } from '@/shared/util/boolean.util'
import { NumberUtil } from '@/shared/util/number.util'
import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'

@Processor(DATABASE_INSERT_QUEUE_NAME, {
  autorun: BooleanUtil.fromString(process.env.PROCESSOR_AUTORUN),
  concurrency: NumberUtil.parse(process.env.DATABASE_INSERT_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, QUEUE_MAX_STALLED_COUNT),
})
export class DatabaseInsertProcessor extends BaseProcessor {
  protected readonly logger = new Logger(DatabaseInsertProcessor.name)

  constructor(
    private readonly dataSource: DataSource,
  ) {
    super()
  }

  async process(job: Job<DatabaseInsertData>): Promise<any> {
    const { data } = job
    if (data.data.message && typeof data.data.message === 'string') {
      // eslint-disable-next-line no-control-regex
      data.data.message = String(data.data.message).replace(/\x00/g, ' ')
    }
    const res = await this.dataSource.manager.save(data.table, data.data)
    await job.updateProgress(100)
    return res
  }
}
