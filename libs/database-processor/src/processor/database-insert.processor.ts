import { DatabaseInsertData } from '@app/database-queue'
import { QUEUE_MAX_STALLED_COUNT } from '@constant/common.constant'
import { DATABASE_INSERT_QUEUE_NAME } from '@constant/database.constant'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'

@Processor(DATABASE_INSERT_QUEUE_NAME, {
  // autorun: false,
  maxStalledCount: QUEUE_MAX_STALLED_COUNT,
  concurrency: NumberUtil.parse(process.env.DATABASE_INSERT_QUEUE_CONCURRENCY, 1),
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
    const res = await this.dataSource.manager.save(data.table, data.data)
    await job.updateProgress(100)
    return res
  }
}
