import { DATABASE_INSERT_QUEUE_NAME, DatabaseInsertData } from '@app/database-queue'
import { Processor } from '@nestjs/bullmq'
import { BaseProcessor } from '@shared/base/base.processor'
import { QUEUE_MAX_STALLED_COUNT } from '@shared/constant/common.constant'
import { Logger } from '@shared/logger/logger'
import { NumberUtil } from '@shared/util/number.util'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'

@Processor(DATABASE_INSERT_QUEUE_NAME, {
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
    return res
  }
}
